import * as Discord from 'discord.js';
import { Command } from './commands/command.js';
import * as helper from './helper.js';
import * as bottypes from './types/bot.js';

let command: Command = null;
let overrides: bottypes.overrides = {};
const disableSlashCommands = false;
export function onMessage(message: Discord.Message) {
    command = null;
    overrides = null;
    if (validateMessage(message)) {
        const args = message.content.slice(helper.vars.config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        runCommand(cmd, message, null, args, true, 'message');
    }
}

// validate prefix, cooldowns, etc.
function validateMessage(message: Discord.Message) {
    if (!(message.content.startsWith(helper.vars.config.prefix))) return false;
    return true;
}
export async function onInteraction(interaction: Discord.Interaction) {
    command = null;
    overrides = null;
    if (!(interaction.type === Discord.InteractionType.ApplicationCommand)) { return; }
    interaction = interaction as Discord.ChatInputCommandInteraction;
    if (disableSlashCommands) {
        interaction.reply({
            content: 'Interaction based commands are currently unsupported in this version',
            allowedMentions: { repliedUser: false },
            flags: Discord.MessageFlags.Ephemeral,
        });
        return;
    }
    let args = [];
    const cmd = interaction.commandName;
    runCommand(cmd, null, interaction, args, true, 'interaction');
}

const infoArgs = ['uptime', 'server', 'website', 'timezone', 'version', 'v', 'dependencies', 'deps', 'source'];

// permissions
function commandCheck(cmd: string, message: Discord.Message, interaction: Discord.ChatInputCommandInteraction, canReply: boolean) {
    // commands that use embeds
    const requireEmbedCommands: string[] = [
        'help', 'commands', 'list', 'command', 'h',
        'info', 'i',
        'invite',
        'ping',
        'stats',
        'checkperms', 'fetchperms', 'checkpermissions', 'permissions', 'perms',
        'clear',
        'find', 'get',
        'prefix', 'servers', 'userinfo'
    ];

    // commands where the bot requires admin in the current server
    const botRequireAdmin: string[] = [
        'checkperms', 'fetchperms', 'checkpermissions', 'permissions', 'perms',
        'get',
        'userinfo',
    ];

    // commands where user needs either admin or owner status
    const userRequireAdminOrOwner: string[] = [
        'checkperms', 'fetchperms', 'checkpermissions', 'permissions', 'perms',
    ];

    // commands where user needs owner 
    const userRequireOwner: string[] = [
        'crash', 'clear', 'debug', 'servers'
    ];

    // list of commands that are disabled for whatever reason
    const disabled: string[] = [
    ];

    const missingPermsBot: Discord.PermissionsString[] = [];
    const missingPermsUser: string[] = [];
    if (requireEmbedCommands.includes(cmd) && !helper.tools.checks.botHasPerms(message ?? interaction, ['EmbedLinks'])) {
        missingPermsBot.push('EmbedLinks');
    }
    if (botRequireAdmin.includes(cmd) && !helper.tools.checks.botHasPerms(message ?? interaction, ['Administrator'])) {
        missingPermsBot.push('Administrator');
    }
    if (userRequireAdminOrOwner.includes(cmd) && !(helper.tools.checks.isAdmin(message?.author?.id ?? interaction.member.user.id, message?.guildId ?? interaction?.guildId) || helper.tools.checks.isOwner(message?.author?.id ?? interaction.member.user.id))) {
        missingPermsUser.push('Administrator');
    }
    if (userRequireOwner.includes(cmd) && !helper.tools.checks.isOwner(message?.author?.id ?? interaction.member.user.id)) {
        missingPermsUser.push('Owner');
    }

    if (missingPermsBot.length > 0 && !(message ?? interaction).channel.isDMBased) {
        helper.tools.commands.sendMessage({
            type: "message",
            message,
            interaction,
            args: {
                content: 'The bot is missing permissions.\nMissing permissions: ' + missingPermsBot.join(', ')
            },

        },
            canReply);
        return false;
    }
    if (missingPermsUser.length > 0) {
        helper.tools.commands.sendMessage({
            type: "message",
            message,
            interaction,
            args: {
                content: 'You do not have permission to use this command.\nMissing permissions: ' + missingPermsUser.join(', ')
            },
        },
            canReply);
        return false;
    }

    if (disabled.includes(cmd)) {
        helper.tools.commands.sendMessage({
            type: "message",
            message,
            interaction,
            args: {
                content: 'That command is currently disabled and cannot be used.'
            },
        },
            canReply);
        return false;
    }
    return true;
}

function commandSelect(cmd: string, args: string[]) {
    if (infoArgs.some(x => x.toLowerCase() == cmd.toLowerCase())) {
        args = [cmd];
        cmd = 'info';
    }

    switch (cmd) {
        case 'list':
            args.unshift('list');
        case 'help': case 'commands': case 'command': case 'h':
            command = new helper.commands.gen.Help();
            break;
        case 'info': case 'i':
            command = new helper.commands.gen.Info();
            break;
        case 'invite':
            command = new helper.commands.gen.Invite();
            break;
        case 'ping':
            command = new helper.commands.gen.Ping();
            break;
        case 'stats':
            command = new helper.commands.gen.Stats();
            break;

        // // admin
        case 'checkperms': case 'fetchperms': case 'checkpermissions': case 'permissions': case 'perms':
            command = new helper.commands.admin.CheckPerms();
            break;
        case 'crash':
            command = new helper.commands.admin.Crash();
            break;
        case 'clear':
            command = new helper.commands.admin.Clear();
            break;
        case 'debug':
            command = new helper.commands.admin.Debug();
            break;
        case 'find': case 'get':
            command = new helper.commands.admin.Find();
            break;
        case 'leaveguild': case 'leave':
            command = new helper.commands.admin.LeaveGuild();
            break;
        case 'prefix':
            command = new helper.commands.admin.Prefix();
            break;
        case 'servers':
            command = new helper.commands.admin.Servers();
            break;

        case 'roll': case 'rng': case 'randomnumber': case 'randomnumbergenerator': case 'pickanumber': case 'pickanum':
            command = new helper.commands.fun.Roll();
            break;
        default:
            command = null;
            break;
    }
    return args;
}

function runCommand(cmd: string, message: Discord.Message, interaction: Discord.ChatInputCommandInteraction, args: string[], canReply: boolean, type: "message" | "interaction") {
    const isValid = commandCheck(cmd, message, interaction, canReply);
    if (isValid) {
        const helpOverrides: string[] = ['-h', '-help', '--h', '--help'];
        if (helpOverrides.some(x => args?.includes(x))) {
            args = [cmd];
            cmd = 'help';
        }
        args = commandSelect(cmd, args);
        if (command) {
            startType(message ?? interaction);
            command.setInput({
                message,
                interaction,
                args,
                date: new Date(),
                id: helper.tools.commands.getCmdId(),
                overrides,
                canReply,
                type,
            });
            command.execute();
        }
    }
}

function startType(object: Discord.Message | Discord.Interaction) {
    try {
        (object.channel as Discord.GuildTextBasedChannel).sendTyping();
        setTimeout(() => {
            return;
        }, 1000);
    } catch (error) {
    }
}