// initialise client commands
import * as Discord from 'discord.js';
import * as helper from './helper.js';

export async function main() {
    const docommands: boolean = true;
    if (docommands) run();
    else helper.vars.client.application?.commands.set([]);
}

function run() {
    const commands = helper.vars.client.application?.commands;
    commands?.set([
        // gen
        {
            name: 'help',
            description: 'Displays all commands',
            dmPermission: true,
            options: [
                {
                    name: 'command',
                    description: 'Displays help for a specific command',
                    type: Discord.ApplicationCommandOptionType.String,
                    required: false,
                }
            ]
        },
        {
            name: 'ping',
            description: 'Pong!',
            dmPermission: true,
        },
        {
            name: 'stats',
            description: 'Displays stats about the bot',
            dmPermission: true,
        },

        {
            name: 'roll',
            description: 'Returns a random number',
            dmPermission: true,
            options: [
                {
                    name: 'max',
                    description: 'The maximum number to get',
                    type: Discord.ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'min',
                    description: 'The minimum number to get',
                    type: Discord.ApplicationCommandOptionType.Number,
                    required: false,
                    minValue: 0
                }
            ]
        },
        //below are admin related commands
        {
            name: 'checkperms',
            description: 'Checks the permissions of a user',
            dmPermission: false,
            options: [
                {
                    name: 'user',
                    description: 'The user to check the permissions of',
                    type: Discord.ApplicationCommandOptionType.User,
                    required: true,
                }
            ]
        },
        {
            name: 'find',
            description: 'Finds details of a user/guild/channel/role/emoji/sticker',
            dmPermission: false,
            options: [
                {
                    name: 'type',
                    description: 'The type of info to fetch',
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'User', value: 'user' },
                        { name: 'Guild (server)', value: 'guild' },
                        { name: 'Channel', value: 'channel' },
                        { name: 'Role', value: 'role' },
                        { name: 'Emoji', value: 'emoji' },
                        { name: 'Sticker', value: 'sticker' },
                    ]
                },
                {
                    name: 'id',
                    description: 'The ID to fetch',
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                }
            ]
        },
        {
            name: 'servers',
            description: 'Displays all servers the bot is in',
            dmPermission: false,
        },
        {
            name: 'leaveguild',
            description: 'Leaves a server',
            dmPermission: false,
            options: [
                {
                    name: 'guild',
                    description: 'The server to leave',
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
        },
    ]);

}