const m3u8 = require('m3u8');
const m3u8stream = require('m3u8stream');
const axios = require('axios');
const stream_id_2 = "jzkbprff40iqj646a697cyrvl0zt2m6";
const stream = require('stream');
const chalk = require('chalk');
const AudioLoader = require('./audio-loader.js');
const https = require('https');


module.exports = class TwitchAudio extends AudioLoader {
    constructor() {
        super();
    }

    /**
     * Get the stream's audio.
     * @param {String} channel - The Twitch channel. 
     */
    async getStreamAudio(chnl) {
        let channel = chnl;
        console.log(`Getting Twitch audio from Twitch user ${channel}...`);
        if(channel.includes('https://twitch.tv/')) {
            channel = chnl.split('').slice('https://twitch.tv/'.length).join('');
        } else if(channel.includes('https://www.twitch.tv/')) {
            channel = chnl.split('').slice('https://www.twitch.tv/'.length).join('');
        } else if(channel.includes('http://twitch.tv/')) {
            channel = chnl.split('').slice('http://twitch.tv/'.length).join('');
        } else if(channel.includes('http://www.twitch.tv/')) {
            channel = chnl.split('').slice('http://www.twitch.tv/'.length).join('');
        }
        return new Promise(async (resolve, reject) => {
            try {
                const res = await axios.get(`https://api.twitch.tv/api/channels/${channel}/access_token?client_id=${stream_id_2}`, {httpsAgent: new https.Agent({rejectUnauthorized:false})});
                const token = res.data;
                const anotherRes = await axios.get(`https://usher.ttvnw.net/api/channel/hls/${channel}.m3u8?player=twitchweb&token=${token.token}&sig=${token.sig}&allow_audio_only=true&allow_source=true&type=any&p=${Math.floor(Math.random() * 100000)}&client_id=${stream_id_2}`);
                const parser = m3u8.createStream();
                const s = new stream.Readable();
                s.push(anotherRes.data);
                s.push(null);
                s.pipe(parser);
                
                parser.on('item', (item) => {
                    if(item.get('video') == 'audio_only') {
                        const strem = new stream.PassThrough();
                        let req = m3u8stream(item.get('uri'));
                        req.pipe(strem);

                        resolve(strem);
                    }
                });
            } catch (err) {
                console.error(`Error in getting stream audio for channel ${channel}: ${err.stack}`);
                reject(err);
            }
        });
    }
}