const express = require('express');
const app = express();
const config = require('./config.json');
const mlc = config.musiclink.server;
const chalk = require('chalk');
const prism = require('prism-media');
let server;
const ytdl = require('ytdl-core');
const jsonp = require('jsonp');
const pckg = require('./package.json');
const base64 = require('./util/base64.js');
const audioLoader = require('./util/audio-loader.js');
const twitchAudio = require('./util/twitch-audio.js');
const voice = require('./util/voice.js');
let isAllOn = 0;
const WS = require("ws");
const wss = new WS.Server({host: mlc.ws.address, port: mlc.ws.port});
const endin = "\n\nFor support, go to the Discord server here: https://discord.gg/dNN4azK";
const axios = require('axios');
var stdin = process.openStdin();
const search = require('./util/search.js');
function clean(text) { // For Eval
	if (typeof(text) === "string")
	  return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	else
		return text;
}
let trackInfo = {};

const sca = require('./util/soundcloud-audio.js');
const sc = new sca();

let musicClients = {};
this.trackInfo = trackInfo;
stdin.addListener("data", function(code) {
	try {
		let evaled = eval(code.toString());
		if (typeof evaled !== "string")
			evaled = require("util").inspect(evaled);
		console.log(`Evaluated to: ${clean(evaled)}`);
	} catch (err) {
		console.error(`Error during evaluation: ${clean(err)}`);
  	}
});

let voiceSessions = {};

function noop() {}

function heartbeat() {
	this.isAlive = true;
}

// http://patorjk.com/software/taag/#p=display&f=Doom&t=Discord%20MusicLink
console.log(`
${chalk.hex('7289DA')('______ _                       _')}  ${chalk.red('___  ___          _')}      ${chalk.yellow('_     _       _    ')}
${chalk.hex('7289DA')('|  _  (_)                     | |')} ${chalk.red('|  \\/  |         (_)')}    ${chalk.yellow('| |   (_)     | |   ')}
${chalk.hex('7289DA')('| | | |_ ___  ___ ___  _ __ __| |')} ${chalk.red('| .  . |_   _ ___ _  ___')}${chalk.yellow('| |    _ _ __ | | __')}
${chalk.hex('7289DA')('| | | | / __|/ __/ _ \\| \'__/ _` |')} ${chalk.red('| |\\/| | | | / __| |/ __')}${chalk.yellow('| |   | | \'_ \\| |/ /')}
${chalk.hex('7289DA')('| |/ /| \\__ \\ (_| (_) | | | (_| |')}${chalk.red(' | |  | | |_| \\__ \\ | (__')}${chalk.yellow('| |___| | | | |   < ')}
${chalk.hex('7289DA')('|___/ |_|___/\\___\\___/|_|  \\__,_|')}${chalk.red(' \\_|  |_/\\__,_|___/_|\\___')}${chalk.yellow('\\_____/_|_| |_|_|\\_\\')}																	  
`);

console.log(`
	${chalk.red('Author')}: ${chalk.blueBright('BluSpring')}
	
	${chalk.green('NodeJS')} version: ${chalk.green(process.version)}
	${chalk.red('Music')}${chalk.yellow('Link')} version: ${chalk.green('v' + pckg.version)}
	${chalk.grey('GitHub')}: ${chalk.cyan('https://github.com/BluSpring/discord-musiclink')}
`);

console.log('[' + chalk.red('Music') + chalk.yellow('Link') + `] Loading ${chalk.hex('7289DA')('discord')}-${chalk.red('music')}${chalk.yellow('link')}...`);
try {
	app.listen(config.server.port, config.server.host, () => {
		isAllOn++;
		console.log(`${chalk.green('[Express]')} Successfully started ExpressJS server with host "${config.server.address}" and port ${config.server.port}`)
	});
} catch (err) {
	console.error(`${chalk.red('ERROR [NET 312]')}: ${err.stack}\n\nFor support, go to the Discord server here: https://discord.gg/dNN4azK`)
}
wss.on('error', (err) => {
	console.error(`${chalk.red('ERROR [NET 311]')}: ${err.stack}${endin}`);
});
wss.on('connection', function connection(ws, req) {
	ws.isAlive = true;
	ws.on('pong', heartbeat);
	if(req.headers['x-forwarded-for']) {
		console.log(`${chalk.green('[WebSocket]')} IP ${req.headers['x-forwarded-for'].split(/\s*,\s*/)[0]} (Proxy) connected to WebSocket!`);
	} else {
		console.log(`${chalk.green('[WebSocket]')} IP ${req.connection.remoteAddress} (Regular) connected to WebSocket!`);
	}
	ws.on('message', async msg => {
		// voiceUpdate, play, stop, pause, volume, seek, destroy, 4[updateVoice(mute/deaf)]

		/* JSON example
			{
				"op": "play",
				"track": "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
				"guildID": "395602291874594816",
				"userID": "395602291874594493"
				"token": "fdjoo",
				"endpoint": "smart.loyal.discord.gg",
				"sessionID": "f3h044h03f0949090"
			}
		*/
		const message = JSON.parse(msg);
		if(message.op == "play") {
			try {
				console.log(`${chalk.green('[WebSocket]')} Received message operation "play" from ${req.connection.remoteAddress}.`);
				if(trackInfo[message.track] == undefined) {
					return console.log(`${chalk.green('[WebSocket]')} Apparently, ${req.connection.remoteAddress} sent a Base64 track that does not exist in the system.`);
				} else {
					console.log(`${chalk.green('[WebSocket]')} Received track "${message.track}" by ${req.connection.remoteAddress}.`)
				}

				if(voiceSessions[message.channelID] && voiceSessions[message.channelID].connection)
					voiceSessions[message.channelID].connection.stopPlaying();

				const track = JSON.parse(trackInfo[message.track]).url;

				if(track.includes('twitch.tv')) {
					const TwitchAudio = new twitchAudio();
					TwitchAudio.getStreamAudio(track)
					.then(str => {
						if(!voiceSessions[message.channelID])
						voiceSessions[message.channelID] = {
							token: message.token,
							server_id: message.guildID,
							user_id: message.userID,
							endpoint: message.endpoint,
							channel_id: message.channelID,
							session_id: message.sessionID
						}
		
						const VoicePlayer = new voice(voiceSessions[message.channelID]);
						musicClients[message.channelID] = VoicePlayer;
						VoicePlayer.play(str);
						VoicePlayer.on('end', () => {
							delete musicClients[message.channelID]
						});
					})
					.catch(err => {
						console.error(err.stack);
					});
				} else if(track.includes('youtube.com')) {
					if(!voiceSessions[message.channelID])
					voiceSessions[message.channelID] = {
						token: message.token,
						server_id: message.guildID,
						user_id: message.userID,
						endpoint: message.endpoint,
						channel_id: message.channelID,
						session_id: message.sessionID
					}

					const VoicePlayer = new voice(voiceSessions[message.channelID]);
					musicClients[message.channelID] = VoicePlayer;
					const playerYTDL = ytdl(track);
					playerYTDL.on('error', (err) => {
						console.error(`${chalk.red(`[YTDL Error]`)} ${err.stack}`);
					});
					VoicePlayer.play(playerYTDL);
					VoicePlayer.on('end', () => {
						delete musicClients[message.channelID]
					});
				} else if(track.includes('soundcloud.com')) {
					if(!voiceSessions[message.channelID])
					voiceSessions[message.channelID] = {
						token: message.token,
						server_id: message.guildID,
						user_id: message.userID,
						endpoint: message.endpoint,
						channel_id: message.channelID,
						session_id: message.sessionID
					}

					const VoicePlayer = new voice(voiceSessions[message.channelID]);
					musicClients[message.channelID] = VoicePlayer;
					VoicePlayer.play(await sc.getStream(track));
					VoicePlayer.on('end', () => {
						delete musicClients[message.channelID]
					});
				}
			} catch (err) {
				console.error(`${chalk.red('[Error (WS Player)]')} ${err.stack} (idk where the error is.)`);
			}
		}
	});
});
wss.on('listening', () => {
	isAllOn++;
	console.log(`${chalk.green('[WebSocket]')} Successfully started WebSocketServer with host "${mlc.ws.host}" and port ${mlc.ws.port}!`)
});	


const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate() && console.log(`Terminated connection ${ws.url}`);

		ws.isAlive = false;
		ws.ping(noop);
	});
}, 30000);

/* Some YT IDs
	7svmoZcY8UA
	bmFrHM3pDN0
	aLibWXsYqO0
	gKqf5aOyvXw
	pOn3m5jemno
	3quakSewhrg
	4v5hXZdbUj8
*/
var idkk = setInterval(() => {
	if(isAllOn == 2) {
		console.log(`[${chalk.red('Music')}${chalk.yellow('Link')}] All servers are now ready!`);
		clearInterval(idkk);
	} 
}, 50);

app.get('/loadtracks', async (req, res) => {
	console.log(`GET /loadtracks`);
	//console.log(req.headers);
	if(req.headers.authorization && req.headers.authorization == mlc.password) {
	
		if(!req.headers.identifier)
			return res.send(`No songs given.`) && console.log(`No songs given? Really?`);
		
		const track = req.headers.identifier;
		//console.log(track);
		//console.log(track.split(':'));
		
		if(track.startsWith('ytsearch:')) {
			search.searchYT(track.split(':').slice(1).join('').split(' ').join('+'))
			.then(resp => {
				ytdl.getInfo(`https://www.youtube.com${resp}`, (err, info) => {
					if(err)
						return console.error(`${chalk.red('[YTSearch Error]')} ${err}`) && res.send(err);
					var encoded = base64.encode(`https://www.youtube.com${resp}`);
					trackInfo[encoded] = JSON.stringify({ 
						url: `https://www.youtube.com${resp}` ,
						title: info.player_response.videoDetails.title,
						author: {
							name: info.author.name,
							avatar: info.author.avatar,
							url: info.author.channel_url
						},
						views: info.view_count,
						timestamp: info.timestamp,
						thumbnail: `https://i.ytimg.com/vi/${info.player_response.videoDetails.videoId}/maxresdefault.jpg`
					});
					res.send(encoded);
				});
			})
			.catch(err => {
				console.error(`${chalk.red('[YTSearch Error]')} ${err}`);
			});
		} else if(track.includes('twitch.tv')) {
			var encoded = base64.encode(`${track}`);
			trackInfo[encoded] = JSON.stringify({
				url: (track.includes('http') && track.includes('://')) ? track : `https://twitch.tv/${track}`
			});
			console.log(encoded);
			res.send(encoded);
		} else if(track.includes('youtu') && track.includes('be')) {
			ytdl.getInfo(track, (err, info) => {
				var encoded = base64.encode(info.video_url);
				trackInfo[encoded] = JSON.stringify({ 
					url: info.video_url,
					title: info.player_response.videoDetails.title,
					author: {
						name: info.author.name,
						avatar: info.author.avatar,
						url: info.author.channel_url
					},
					views: info.view_count,
					timestamp: info.timestamp,
					thumbnail: `https://i.ytimg.com/vi/${info.player_response.videoDetails.videoId}/maxresdefault.jpg`
				});
				res.send(encoded);
			});
		} else if(track.includes('soundcloud')) {
			var encoded = base64.encode(tt);
			trackInfo[encoded] = JSON.stringify({
				url: tt
			});
			res.send(encoded);
		} else if(track.startsWith('scsearch:')) {
			const tt = await sc.search(track.split(':').slice(1).join('').split(' ').join('+'));
			var encoded = base64.encode(tt);
			trackInfo[encoded] = JSON.stringify({
				url: tt
			});
			res.send(encoded);
		} else {
			res.send(`Invalid URL type (will be adding more soon.)`);
			console.log(`Hm. Welp. Here, I'm not dealing with this - ${track}`);
		}
	} else {
		res.send(`Authorization invalid!`);
		console.log(`Damn, authorization invalid.`);
	}
});

app.get('/info', (req, res) => {
	if(req.headers.authorization && req.headers.authorization == mlc.password) {
		if(!req.headers.identifier)
			return res.send(`No Base64 track given.`);

		if(!trackInfo[req.headers.identifier])
			return res.send(`The Base64 track given is invalid.`);

		res.send(trackInfo[req.headers.identifier]);
	} else {
		res.send(`Authorization invalid!`);
	}
});