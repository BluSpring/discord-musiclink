const axios = require('axios');
const htmlparser = require('htmlparser2');
const m3u8stream = require('m3u8stream');
const stream = require('stream');
module.exports = class SoundCloudAudio {
    constructor() {
        this.clientID = "zfZfdO1GXQUWjZ7WE3aqb6WWDzF5csC7";
    }

    search(query) {
        return new Promise((resolve, reject) => {
            let allDaAs = [];
            const parser = new htmlparser.Parser({
                onopentag: function(name, attribs){
                    if(name.toString() == 'a'){
                        if(!attribs.href.startsWith('/')) return;
                        if(attribs.class) return;
                        if(attribs.href.includes('/search')) return;
                        allDaAs.push(`https://soundcloud.com${attribs.href}`);
                    }
                }
            });
            axios.get(`https://soundcloud.com/search?q=${query}`)
            .then(res => { 
                if(res.status == 200) {
                    parser.write(res.data);
                    parser.end();
                    resolve(allDaAs[0]);
                }
            });
        });
    }

    getStream(url) {
        return new Promise((resolve, reject) => {
            let streamURL = null;
            const parser = new htmlparser.Parser({
                onopentag: function(name, attribs){
                    if(name.toString() == 'meta' && attribs.property && attribs.content){
                        if(!attribs.content.startsWith('https://w.soundcloud.com/player/')) return;
                        const url = new URL(attribs.content);
                        streamURL = url.searchParams.get('url').replace('%3A%2F%2F', '://').replace('%2F', '/').replace('%2F', '/');
                    }
                }
            }, {decodeEntities: true});

            let inScript = false;
            const parser2 = new htmlparser.Parser({
                onopentag: function(name, attribs){
                    if(name.toString() == 'script'){
                        inScript = true;
                        console.log(attribs);
                    }
                },
                ontext: (text) => {
                    if(inScript) {
                        if(!text.includes('var c=[') && !text.includes('https://api-widget.soundcloud.com/media/soundcloud:tracks:')) return;
                        let ax = text.search('https://api-widget.soundcloud.com/media/soundcloud:tracks:');
                        ax = text.substring(ax, text.length);
                        ax = text.match(/https:\/\/api-widget.soundcloud.com\/media\/soundcloud:tracks:\w*\/\w*-\w*-\w*-\w*-\w*\/\w*\/\w*/g);
                        // Holy shit that RegExp is long as hell
                        streamURL = ax[0];
                    }
                },
                onclosetag: (name) => {
                    if(name.toString() == 'script') {
                        inScript = false;
                    }
                }
            }, {decodeEntities: true});

            console.log(url);

            axios.get(url)
            .then(res => {
                parser.write(res.data);
                parser.end();

                axios.get(`https://w.soundcloud.com/player/?url=${streamURL}`)
                .then(async ress => {
                    parser2.write(ress.data);
                    parser2.end();
                    const streamURLRes = await axios.get(`${streamURL}?client_id=${this.clientID}`);
                    const strem = new stream.PassThrough();
                    let req = m3u8stream(streamURLRes.data.url);
                    req.pipe(strem);
                    resolve(strem);
                });
            });
        });
    }
}

/*
webpackJsonp([], {
    0:function(e, t, n) {
        function r(e) {
            return i.every(function(t) {
                return t in e.prototype
            }
            )
        }
        function a(e) {
            var t=r(e);
            return t?function(t) {
                var n, r=o;
                t.lastFetchTime&&(r=t.lastFetchTime, delete t.lastFetchTime), n=new e(t, {
                    parse: !0
                }
                ), n.lastFetchTime=r, n.release()
            }
            :e
        }
        var c=[ {
            "id":139, "data":[ {
                "comment_count": 0, "full_duration": 309135, "downloadable": false, "domain_lockings": [], "created_at": "2017-08-24T12:57:39Z", "description": "Please see the pv and read the afterword ! https://tmblr.co/ZUmWze2P9rzKM\n\n-----\nFact: we cannot perceive sound in space\n\nThe previous day has ended, here's a song for those who hurt, those who grew, those who are my stars, for you flickering star who I've let down, for all of you.\n\nThank you Haru for helping me with this despite your busy schedule;\n\n---\n\n\nIllustration, PV, Lyrics, Melody: avieri\nMusic and Composition, Mixing : ハル https://soundcloud.com/hzp", "media": {
                    "transcodings":[ {
                        "url":"https://api-widget.soundcloud.com/media/soundcloud:tracks:339288703/90b23a5c-c9f0-4ad4-ab08-39aab0148be6/stream/hls", "preset":"mp3_0_0", "duration":309135, "snipped":false, "format": {
                            "protocol": "hls", "mime_type": "audio/mpeg"
                        }
                        , "quality":"sq"
                    }
                    , {
                        "url":"https://api-widget.soundcloud.com/media/soundcloud:tracks:339288703/90b23a5c-c9f0-4ad4-ab08-39aab0148be6/stream/progressive", "preset":"mp3_0_0", "duration":309135, "snipped":false, "format": {
                            "protocol": "progressive", "mime_type": "audio/mpeg"
                        }
                        , "quality":"sq"
                    }
                    , {
                        "url":"https://api-widget.soundcloud.com/media/soundcloud:tracks:339288703/fc468f0d-6ce8-41d8-adae-5c427243899c/stream/hls", "preset":"opus_0_0", "duration":309135, "snipped":false, "format": {
                            "protocol": "hls", "mime_type": "audio/ogg; codecs=\"opus\""
                        }
                        , "quality":"sq"
                    }
                    ]
                }
                , "title":"【Original】☆ To My Stars: Epilogue【avieri】", "publisher_metadata": {
                    "urn": "soundcloud:tracks:339288703", "artist": "amidst*orion", "id": 339288703
                }
                , "duration":309135, "has_downloads_left":true, "artwork_url":"https://i1.sndcdn.com/artworks-000239676421-rycb8k-large.jpg", "public":true, "streamable":true, "tag_list":"\"to my stars epilogue\" \"star series\" avieri", "download_url":null, "genre":"", "id":339288703, "reposts_count":2, "state":"finished", "label_name":null, "last_modified":"2017-08-24T12:57:40Z", "commentable":true, "policy":"ALLOW", "visuals":null, "kind":"track", "purchase_url":null, "sharing":"public", "uri":"https://api.soundcloud.com/tracks/339288703", "secret_token":null, "download_count":0, "likes_count":34, "urn":"soundcloud:tracks:339288703", "license":"all-rights-reserved", "purchase_title":null, "display_date":"2017-08-24T12:57:39Z", "embeddable_by":"all", "release_date":null, "user_id":10905312, "monetization_model":"NOT_APPLICABLE", "waveform_url":"https://wave.sndcdn.com/P8PntBApI9EV_m.json", "permalink":"original-to-my-stars-epilogueavieri", "permalink_url":"https://soundcloud.com/eribythewindow/original-to-my-stars-epilogueavieri", "user": {
                    "avatar_url": "https://i1.sndcdn.com/avatars-000408377868-ulrodn-large.jpg", "first_name": "Eri by the Window (えり)", "full_name": "Eri by the Window (えり)", "id": 10905312, "kind": "user", "last_modified": "2019-04-29T08:55:03Z", "last_name": "", "permalink": "eribythewindow", "permalink_url": "https://soundcloud.com/eribythewindow", "uri": "https://api.soundcloud.com/users/10905312", "urn": "soundcloud:users:10905312", "username": "ʚ avieri ɞ", "verified": false, "city": "", "country_code": "PH"
                }
                , "playback_count":1544
            }
            ]
        }
        ], o=Date.now(), i=["resource_type", "get", "set", "addSubmodel", "release"];
        c.forEach(function(e) {
            try {
                var t=a(n(e.id));
                e.data.forEach(function(e) {
                    t(e)
                }
                )
            }
            catch(r) {}
        }
        )
    }
}

);
*/