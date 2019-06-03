# Discord MusicLink
A music bot link based on [Frederikam's Lavalink](https://github.com/Frederikam/Lavalink). Made using [NodeJS](https://nodejs.org) and [Eris](https://github.com/abalabahaha/eris).
<br><br>
Join the [XeriApps Support Server](https://discord.gg/dNN4azK) for support on MusicLink.

# How to use
(Example in [discord.js](https://discord.js.org))
```js
const Discord = require('discord.js');
const bot = new Discord.Client();
const activationTime = Date.now();
const WebSocket = require('ws');
const axios = require('axios');
let ws;
let dataVoice = {};
bot.on('ready', () => {
    console.log(`[Discord.JS Stable] Ready in ${Date.now() - activationTime}ms`);
    ws = new WebSocket('ws://localhost:90', {
        headers: {
            userID: bot.user.id
        }
    });
    ws.on('open',() => {
        console.log(`[WS] WS on.`);
    });
})
.on('message', async msg => {
    const args = msg.content.split(' ').slice(1);
    if(msg.content.startsWith('!join')) {
        msg.channel.send('Hold on...');
        
        axios.get(`http://localhost:2333/loadtracks`, {headers: {
            identifier: args.join(' '),
            authorization: "youshallnotpassWORD"
        }})
        .then(res => {
            if(!dataVoice[message.guild.id]) {
                bot.ws.send({
                    op: 4,
                    shard: bot.shard ? bot.shard.id : 0,
                    d: {
                        guild_id: msg.guild.id,
                        channel_id: msg.member.voiceChannelID,
                        self_mute: false,
                        self_deaf: true
                    }
                });
                bot.on('self.voiceServer', (data) => {
                    const d = data;
                    msg.channel.send('Should be playing now!');
                    dataVoice[message.guild.id] = d;
                    ws.send(JSON.stringify({
                        op: "play",
                        guildID: d.guild_id,
                        token: d.token,
                        endpoint: d.endpoint,
                        userID: bot.user.id,
                        sessionID: msg.guild.me.voiceSessionID,
                        track: res.data,
                        channelID: msg.guild.me.voiceChannelID
                    }));
                });
            } else {
                msg.channel.send('Should be playing now!'); 
                ws.send(JSON.stringify({
                    op: "play",
                    guildID: dataVoice.guild_id,
                    token: dataVoice.token,
                    endpoint: dataVoice.endpoint,
                    userID: bot.user.id,
                    sessionID: msg.guild.me.voiceSessionID,
                    track: res.data,
                    channelID: msg.guild.me.voiceChannelID
                }));
            }
        });
    }
})
.login("bot token here");
```
<br>
So, you should connect to MusicLink's WebSocket once the bot is ready. When you want to play a song, get the /loadtracks endpoint with the identifier header being the song URL or search. After receiving the base64 track, use your bot's Discord WebSocket to connect to the voice channel, and have the voiceServerUpdate event be the one sending this info to the MusicLink WebSocket:<br>
 - The server ID given by the event (note that this is different from the server ID you get in Developer Mode)<br>
 - The token given by the event<br>
 - The "play" opcode<br>
 - The endpoint given by the event<br>
 - The bot's user ID<br>
 - The session ID of the bot in the server<br>
 - The base64 track<br>
 - The voice channel ID of the server (note that this is different from the actual ID)
<br><br>
# Streaming Types
[Twitch](https://twitch.tv)<br>
[YouTube](https://youtube.com)<br>
[Soundcloud](https://soundcloud.com)<br><br>

Support for Bandcamp, Vimeo, Mixer, DLive, local and other HTTP sources will be added soon.
<br>
# Search types
`ytsearch:Search query` - YouTube search
`scsearch:Search query` - Soundcloud search
<br>
# Notes
Deactivating sources does NOT work at the moment, and neither does the buffer duration. Will be added soon.
<br>
# Modules used & Special Thanks
Modules: 
 - [axios](https://github.com/axios/axios) (For requests)<br>
 - [Eris](https://github.com/abalabahaha/eris) (For voice, wanted to use discord.js, but Eris was more friendly towards 3rd party usage)<br>
 - [htmlparser2](https://npmjs.com/package/htmlparser2) (To parse HTML for searches. Really handy.)<br>
 - [chalk](https://npmjs.com/package/chalk) (To do some beautiful colours in console.)<br>
 - [express](https://npmjs.com/package/express) (For the request server)<br>
 - [m3u8](https://npmjs.com/package/m3u8) (For music streams)<br>
 - [m3u8stream](https://npmjs.com/package/m3u8stream) (Ditto)<br>
 - [ws](https://npmjs.com/package/ws) (Absolutely amazing WebSocket server.)
<br><br>
Special Thanks:
 - [Frederikam](https://frederikam.com/) - For Lavalink.<br>
 - [abalabahaha](https://abal.moe) - For making Eris have its voice class be able to be used outside of the module.<br>
 - [Discord](https://discordapp.com) - For their wonderful service.<br>
 - [Dragons99990](https://youtube.com/dragons99990) - For keeping me company while making this.<br>
 - And all the module creators along with the NodeJS guys.
<br><br>
And no thanks to:
 - [CosmicOsmium](https://nishidev.com) - Cuz fuck that guy.