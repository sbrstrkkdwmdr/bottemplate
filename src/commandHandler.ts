import * as Discord from 'discord.js';
import { admin, fun, gen, } from './commandHelper';
import { Command, InputHandler } from './commands/command';
import * as helper from './helper';
import * as checks from './tools/checks';
import * as commandTools from './tools/commands';

function startType(object: Discord.Message | Discord.Interaction) {
    try {
        (object.channel as Discord.GuildTextBasedChannel).sendTyping();
        setTimeout(() => {
            return;
        }, 1000);
    } catch (error) {
    }
}

export class CommandHandler extends InputHandler {
    async onMessage(message: Discord.Message) {
        this.selected = null;
        this.overrides = {};
        if (this.validateMessage(message)) {
            const args = message.content.slice(helper.vars.config.prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            this.runCommand(cmd, message, null, args, true, 'message');
        }
    }
    async onInteraction(interaction: Discord.Interaction) {
        this.selected = null;
        this.overrides = null;
        if (!(interaction.type === Discord.InteractionType.ApplicationCommand)) { return; }
        interaction = interaction as Discord.ChatInputCommandInteraction;
        // interaction?.reply({
        //     content: 'Interaction based commands are currently unsupported in this version',
        //     allowedMentions: { repliedUser: false },
        //     flags: Discord.MessageFlags.Ephemeral,
        // });
        // return;
        let args = [];
        const cmd = interaction.commandName;
        this.runCommand(cmd, null, interaction, args, true, 'interaction');
    }

    validateMessage(message: Discord.Message) {
        if (!(message.content.startsWith(helper.vars.config.prefix))) return false;
        return true;
    }

    commandCheck(cmd: string, message: Discord.Message, interaction: Discord.ChatInputCommandInteraction, canReply: boolean) {
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

        //perms bot needs
        const requireReactions: string[] = [
            'poll', 'vote'
        ];
        const requireMsgManage: string[] = [
            'purge'
        ];

        const botRequireAdmin: string[] = [
            'checkperms', 'fetchperms', 'checkpermissions', 'permissions', 'perms',
            'get',
            'userinfo',
        ];

        //perms user needs
        const userRequireAdminOrOwner: string[] = [
            'checkperms', 'fetchperms', 'checkpermissions', 'permissions', 'perms',
            'userinfo',
            'purge',
        ];

        const userRequireOwner: string[] = [
            'crash', 'clear', 'debug', 'servers'
        ];

        const disabled: string[] = [
        ];

        const missingPermsBot: Discord.PermissionsString[] = [];
        const missingPermsUser: string[] = [];
        if (requireEmbedCommands.includes(cmd) && !checks.botHasPerms(message ?? interaction, ['EmbedLinks'])) {
            missingPermsBot.push('EmbedLinks');
        }
        if (requireReactions.includes(cmd) && !checks.botHasPerms(message ?? interaction, ['AddReactions'])) {
            missingPermsBot.push('AddReactions');
        }
        if (requireMsgManage.includes(cmd) && !checks.botHasPerms(message ?? interaction, ['ManageMessages'])) {
            missingPermsBot.push('ManageMessages');
        }
        if (botRequireAdmin.includes(cmd) && !checks.botHasPerms(message ?? interaction, ['Administrator'])) {
            missingPermsBot.push('Administrator');
        }
        if (userRequireAdminOrOwner.includes(cmd) && !(checks.isAdmin(message?.author?.id ?? interaction.member.user.id, message?.guildId ?? interaction?.guildId) || checks.isOwner(message?.author?.id ?? interaction.member.user.id))) {
            missingPermsUser.push('Administrator');
        }
        if (userRequireOwner.includes(cmd) && !checks.isOwner(message?.author?.id ?? interaction.member.user.id)) {
            missingPermsUser.push('Owner');
        }

        if (missingPermsBot.length > 0 && !(message ?? interaction).channel.isDMBased) {
            commandTools.sendMessage({
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
            commandTools.sendMessage({
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
            commandTools.sendMessage({
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

    commandSelect(cmd: string, args: string[]) {
        switch (cmd) {
            // gen
            case 'list':
                args.unshift('list');
            case 'help': case 'commands': case 'command': case 'h':
                this.selected = new gen.Help();
                break;
            case 'info': case 'i':
                this.selected = new gen.Info();
                break;
            case 'invite':
                this.selected = new gen.Invite();
                break;
            case 'ping':
                this.selected = new gen.Ping();
                break;
            case 'stats':
                this.selected = new gen.Stats();
                break;
            case 'clear':
                this.selected = new admin.Clear();
                break;
            case 'debug':
                this.selected = new admin.Debug();
                break;
            case 'find': case 'get':
                this.selected = new admin.Find();
                break;
            case 'leaveguild': case 'leave':
                this.selected = new admin.LeaveGuild();
                break;
            case 'prefix':
                this.selected = new admin.Prefix();
                break;
            case 'servers':
                this.selected = new admin.Servers();
                break;


            // // misc
            case 'roll': case 'rng': case 'randomnumber': case 'randomnumbergenerator': case 'pickanumber': case 'pickanum':
                this.selected = new fun.Roll();
                break;
            default:
                this.selected = null;
                break;
        }
        return args;
    }

    runCommand(cmd: string, message: Discord.Message, interaction: Discord.ChatInputCommandInteraction, args: string[], canReply: boolean, type: "message" | "interaction") {
        const isValid = this.commandCheck(cmd, message, interaction, canReply);
        if (isValid) {
            const helpOverrides: string[] = ['-h', '-help', '--h', '--help'];
            if (helpOverrides.some(x => args?.includes(x))) {
                args = [cmd];
                cmd = 'help';
            }
            args = this.commandSelect(cmd, args);
            if (this.selected) {
                startType(message ?? interaction);
                this.selected.setInput({
                    message,
                    interaction,
                    args,
                    date: new Date(),
                    id: commandTools.getCmdId(),
                    overrides: this.overrides,
                    canReply,
                    type,
                });
                this.selected.execute();
            }
        }
        this.selected = null;
        this.overrides = {};
    }
}