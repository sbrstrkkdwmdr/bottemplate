console.log('Loading...');
const initdate = new Date();
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import fs from 'fs';
import * as log from './tools/log';

import * as helper from './helper';
import { loops } from './loops';
import * as slashcmds from './slashCommands';

import { ButtonHandler } from './buttonHandler';
import { CommandHandler } from './commandHandler';
import { LinkHandler } from './linkHandler';

console.log('Initialising client...');
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.User
    ]
});

helper.vars.client = client;

client.once('ready', () => {
    const currentDate = new Date();
    const timetostart = currentDate.getTime() - initdate.getTime();
    log.stdout(`
====================================================
BOT IS NOW ONLINE
----------------------------------------------------
Boot time:        ${timetostart}ms
Time:             ${currentDate.toLocaleString()}
Time (ISO):       ${currentDate.toISOString()}
Time (epoch, ms): ${currentDate.getTime()}
Client:           ${client.user.tag} 
Client ID:        ${client.user.id}
====================================================
`);

    if (!fs.existsSync(`${helper.vars.path.precomp}/config/osuauth.json`)) {
        log.stdout(`Creating ${helper.vars.path.precomp}/config/osuauth.json`);
        fs.writeFileSync(`${helper.vars.path.precomp}/config/osuauth.json`,
            '{"token_type": "Bearer", "expires_in": 1, "access_token": "blahblahblah"}', 'utf-8');
    }

    const makeDir = [
        'trackingFiles',
        'logs',
        // 'logs/gen',
        'logs/cmd',
        // 'logs/moderator',
        'cache',
        'cache/commandData',
        'cache/params',
        'cache/debug',
        'cache/debug/command',
        'cache/debug/fileparse',
        'cache/previous',
        'cache/graphs',
        'cache/errors',
        'files',
        'files/maps',
        'files/replays',
        'files/localmaps',
        'files/',
    ];
    const makeFiles = [
        'id.txt',
        'logs/totalcommands.txt',
        'logs/debug.log',
        'logs/updates.log',
        'logs/err.log',
        'logs/warn.log',
        'logs/general.log',
    ];
    makeDir.forEach(dir => {
        if (!fs.existsSync(`${helper.vars.path.main}/` + dir)) {
            console.log(`Creating ${helper.vars.path.main}/${dir}`);
            fs.mkdirSync(`${helper.vars.path.main}/` + dir);
        }
    });
    makeFiles.forEach(file => {
        if (!fs.existsSync(`${helper.vars.path.main}/` + file)) {
            console.log(`Creating ${helper.vars.path.main}/${file}`);
            fs.writeFileSync(`${helper.vars.path.main}/` + file, '');
        }
    });
    client.on('messageCreate', async (message) => {
        const ch = new CommandHandler();
        const lh = new LinkHandler();
        ch.onMessage(message);
        lh.onMessage(message);
        //if message mentions bot and no other args given, return prefix
        if (message.mentions.users.size > 0) {
            if (message.mentions.users.first().id == helper.vars.client.user.id && message.content.replaceAll(' ', '').length == (`<@${helper.vars.client.user.id}>`).length) {
                message.reply({ content: `Global prefix is \`${helper.vars.config.prefix}\``, allowedMentions: { repliedUser: false } });
                return;
            }
        }

        //if message is a cooldown message, delete it after 3 seconds
        if (message.content.startsWith('You\'re on cooldown') && message.author.id == helper.vars.client.user.id) {
            setTimeout(() => {
                message.delete()
                    .catch(err => {
                    });
            }, 5000);
        }
    });
    client.on('interactionCreate', async (interaction) => {
        const ch = new CommandHandler();
        const bh = new ButtonHandler();
        ch.onInteraction(interaction);
        bh.onInteraction(interaction);
    });
    loops();
    slashcmds.main();
});

client.login(helper.vars.config.token);

process.on('warning', e => {
    log.stdout(e.stack);
    console.warn(e.stack);
});