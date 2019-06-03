// Discord.JS + Eris stuff
/*
const VoiceWebSocket = require('discord.js/src/client/voice/VoiceWebSocket');
const VoiceUDP = require('discord.js/src/client/voice/VoiceUDPClient');
const Util = require('discord.js/src/util/Util');
const Constants = require('discord.js/src/util/Constants');
const AudioPlayer = require('discord.js/src/client/voice/player/AudioPlayer');
const VoiceReceiver = require('discord.js/src/client/voice/receiver/VoiceReceiver');
const StreamDispatcher = require('discord.js/src/client/voice/dispatcher/StreamDispatcher');
const Collection = require('discord.js/src/util/Collection');
const OpusEncoders = require('discord.js/src/client/voice/opus/OpusEngineList');
const VolumeInterface = require('discord.js/src/client/voice/util/VolumeInterface');
const VoiceBroadcast = require('discord.js/src/client/voice/VoiceBroadcast');
//const Constants = require('discord.js/src/util/Constants');
const stream = require('stream').Readable;

const secretbox = require('discord.js/src/client/voice/util/Secretbox');

const ffmpegArguments = [
  '-analyzeduration', '0',
  '-loglevel', '0',
  '-f', 's16le',
  '-ar', '48000',
  '-ac', '2',
];
//const EventEmitter = require('events').EventEmitter;
const Prism = require('prism-media');*/

/*const stream = require('stream').Readable;
const Discord = require('discord.js');
const Prism = require('prism-media');
const nodeopus = require('node-opus');
const nacl = require('tweetnacl');*/
const Eris = require('eris');
const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;

module.exports = class VoicePlayer extends EventEmitter {
    constructor(voiceSession) {
        super();
        this.voiceSession = voiceSession;
        this.connection = null;
        this.on('end', () => {
            this.connection.disconnect();
        });
    }

    play(stream, options = {}) {
        const startTime = new Date().getTime();
        const connection = new Eris.VoiceConnection(this.voiceSession.server_id);
        connection.connect({
            endpoint: this.voiceSession.endpoint,
            token: this.voiceSession.token,
            session_id: this.voiceSession.session_id,
            user_id: this.voiceSession.user_id,
            channel_id: this.voiceSession.channel_id
        });
        this.connection = connection;
        console.log(`${chalk.green('[VC]')} Connecting...`);

        connection.on('error', (err) => {
            console.error(`${chalk.red('[VC Error]')} ${err.stack}`);
            this.emit('error', err);
        })
        .on('ready', () => {
            console.log(`${chalk.green('[VC Event]')} Ready in ${Date.now() - startTime}ms. Waiting for audio playback...`);
        })
        .on('warn', (warn) => {
            console.warn(`${chalk.red('[VC Warn]')} ${warn}`);
            //console.log(warn.includes('4006'));
            this.emit('warn', warn);
            if(warn.includes('4006'))
                return this.emit('end');
        })
        .on('debug', (info) => {
            if(info.includes(`"op":3`)) return;
            console.log(`${chalk.green('[VC Debug]')} ${info}`);
        });

        console.log(`${chalk.green('[VC Session]')} Received session data ${JSON.stringify(this.voiceSession)}`);

        if(connection.ready) {
            connection.play(stream);
            console.log(`${chalk.green('[VC]')} Started playing audio.`);
            connection.on('end', () => {
                console.log(`${chalk.green('[VC]')} Audio ended.`);
                this.emit('end');
            });
        } else {
            var idx = setInterval(() => {
                if(connection.ready) {
                    connection.play(stream);
                    clearInterval(idx);
                    console.log(`${chalk.green('[VC]')} Started playing audio.`);
                    connection.on('end', () => {
                        console.log(`${chalk.green('[VC]')} Audio ended.`);
                        this.emit('end');
                    });
                }
            }, 500);
        }
    }
}