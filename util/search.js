var htmlparser = require("htmlparser2");
var axios = require('axios');

module.exports.searchYT = function (query) {
    return new Promise((resolve, reject) => {
        let allDaAs = [];
        var parser = new htmlparser.Parser({
            onopentag: function(name, attribs){
                if(name.toString() == 'a'){
                    if(!attribs.href.startsWith('/watch?v='))
                        return;

                    allDaAs.push(attribs.href);
                    //console.log(allDaAs);
                    //process.exit();
                }
                //console.log(name, attribs)
            },
            ontext: function(text){
                //console.log("-->", text);
            }
        }, {decodeEntities: true});
        axios.get(`https://www.youtube.com/results?search_query=${query}`).then(res => {
            if(res.status == 200) {
                parser.write(res.data);
                parser.end();
                resolve(allDaAs[0]);
            } else {
                console.error(`ERROR [WEB 410-${res.status}]: ${err.stack}\n\nFor support, go to the Discord server here: https://discord.gg/dNN4azK`);
                reject();
            }
        });
    });
};
