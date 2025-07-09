import * as bottypes from '../types/bot';

import * as buttonsObjs from './buttons';

const range = (key: string): string[] => {
    const temp = ['>foo', '<foo', 'foo..bar', '!foo'];
    const temp2: string[] = [];
    temp.forEach(t => temp2.push('-' + key + ' ' + t));
    return temp2;
};

/**
 * <> is required
 * [] is optional
 */

const user: bottypes.commandInfoOption = {
    name: 'user',
    type: 'string/integer/user mention',
    required: false,
    description: 'The user to show',
    format: ['foo', '@foo', '-u foo', '-user foo', '-uid foo',],
    defaultValue: 'The user who ran the command',
};

const page: bottypes.commandInfoOption = {
    name: 'page',
    type: 'integer',
    required: false,
    description: 'The page to show',
    format: ['-p foo', '-page foo'],
    defaultValue: '1',
};

const userAdmin: bottypes.commandInfoOption = {
    name: 'user',
    type: 'integer/user mention',
    required: false,
    description: 'The user to use',
    format: user.format,
    defaultValue: 'The user who ran the command',
};

export const cmds: bottypes.commandInfo[] = [
    {
        name: 'Changelog',
        description: 'Displays the changes for the current version or version requested.',
        usage: 'changelog [version]',
        category: 'general',
        examples: [
            {
                text: 'changelog 0.4.0',
                description: 'Returns the changelog for version 0.4.0'
            },
            {
                text: 'changelog first',
                description: 'Returns the changelog for the first version'
            },
            {
                text: 'changelog pending',
                description: 'Returns the changelog for the upcoming version'
            },
            {
                text: 'versions',
                description: 'Returns a list of all versions'
            },
        ],
        aliases: ['clog', 'changes', 'versions'],
        args: [
            {
                name: 'version',
                type: 'string',
                required: false,
                description: 'The version',
                format: ['major.minor.patch (`0.4.1`) or `first`, `second` etc. `pending` shows upcoming changes'],
                defaultValue: 'latest',
            },
        ]
    },
    {
        name: 'Convert',
        description: ' [use this instead](https://sbrstrkkdwmdr.github.io/tools/convert)',
        usage: 'convert',
        category: 'general',
        examples: [
        ],
        aliases: [],
        args: []
    },
    {
        name: 'Help',
        description: 'Displays useful information about commands.',
        usage: 'help [command]',
        category: 'general',
        examples: [
            {
                text: 'help',
                description: 'Shows the general help page'
            },
            {
                text: 'help convert',
                description: 'Shows information about the convert command'
            },
            {
                text: 'help recent',
                description: 'Shows information about the recent command'
            },
            {
                text: 'help categoryosu',
                description: 'Lists all commands in the osu category'
            },
            {
                text: 'list',
                description: 'Lists all available commands'
            }
        ],
        aliases: ['commands', 'list', 'command', 'h'],
        args: [
            {
                name: 'command',
                type: 'string',
                required: false,
                description: 'The command/category to get information about. Categories are always prefixed with `categoryX`.',
                options: ['list', 'category(category)', '(command)'],
                format: ['foo'],
                defaultValue: 'N/A',
            },
        ]
    },
    {
        name: 'Info',
        description: 'Shows information about the bot.',
        usage: 'info [arg]',
        aliases: ['i', '[arg]'],
        category: 'general',
        args: [
            {
                name: 'arg',
                type: 'string',
                required: false,
                description: 'Return just that specific value',
                options: ['uptime', 'version', 'server', 'website', 'timezone', 'source'],
                format: ['foo'],
                defaultValue: 'null',
            },
        ]
    },
    {
        name: 'Invite',
        description: 'Sends the bot\'s public invite.',
        usage: 'invite',
        aliases: [],
        category: 'general',
    },
    {
        name: 'Ping',
        description: 'Pings the bot and returns the latency.',
        usage: 'ping',
        aliases: [],
        category: 'general',
    },
    {
        name: 'Remind',
        description: 'Sets a reminder. Leave all args blank or use the reminders alias to return a list of reminders',
        usage: 'remind [time] [reminder]',
        category: 'general',
        examples: [
            {
                text: 'remind',
                description: 'Returns a list of reminders.'
            },
            {
                text: 'remind 1h30m30s reminder',
                description: 'Sets a reminder for 1 hour, 30 minutes, and 30 seconds'
            },
            {
                text: 'remind 2:05 fc',
                description: 'Sets a reminder for 2 minutes and 5 seconds'
            },
        ],
        aliases: ['reminders', 'reminder'],
        args: [
            {
                name: 'time',
                type: 'string',
                required: true,
                description: 'The time until the reminder',
                options: [
                    'format: [number][unit] or hh:mm:ss',
                    'units: s, m, h, d, w, y',
                ],
                format: ['[number][unit]...', 'hh:mm:ss'],
                defaultValue: '0s',
            },
            {
                name: 'reminder',
                type: 'string',
                required: false,
                description: 'The reminder',
                format: ['foo'],
                defaultValue: 'null',
            },
            {
                name: 'sendinchannel',
                type: 'boolean',
                required: false,
                description: 'Whether to send the reminder in the channel or in a DM. Admin only',
                options: ['true', 'false'],
                format: ['foo'],
                defaultValue: 'false',
            }
        ]
    },
    {
        name: 'Stats',
        description: 'Shows the bot\'s statistics.',
        usage: 'stats',
        category: 'general',
        aliases: [],
    },
    {
        name: '8Ball',
        description: 'Returns a yes/no/maybe answer to a question.',
        category: 'misc',
        usage: '8ball ',
        examples: [
            {
                text: '8ball is this a good bot?',
                description: 'Returns a yes/no/maybe answer to the question'
            }
        ],
        aliases: ['ask'],
    },
    {
        name: 'CoinFlip',
        description: 'Flips a coin.',
        category: 'misc',
        usage: 'coinflip',
        aliases: ['coin', 'flip'],
    },
    {
        name: 'Gif',
        description: 'Sends a gif.',
        category: 'misc',
        usage: '<type> [target]',
        examples: [
            {
                text: 'slap @SaberStrike',
                description: 'Sends a random gif matching "slap"'
            }
        ],
        aliases: ['hug', 'kiss', 'lick', 'pet', 'punch', 'slap'],
        args: [
            {
                name: 'type',
                type: 'string',
                required: true,
                description: 'The type of gif to send',
                options: ['hug', 'kiss', 'lick', 'pet', 'punch', 'slap'],
                format: [],
                defaultValue: 'N/A',
            },
            {
                name: 'target',
                type: 'user mention',
                required: true,
                description: 'The user to target',
                format: ['<@foo>',],
                defaultValue: 'N/A',
            }
        ]
    },
    {
        name: 'Janken',
        description: 'Plays janken with the bot. (aka paper scissors rock or rock paper scissors or whatever weird order it\'s in).',
        category: 'misc',
        usage: 'janken',
        aliases: ['paperscissorsrock', 'rockpaperscissors', 'rps', 'psr'],
        args: [
            {
                name: 'choice',
                type: 'string',
                required: true,
                description: 'Paper, scissors or rock.',
                options: ['rock', 'paper', 'scissors', 'グー', 'チョキ', 'パー'],
                format: ['foo',],
                defaultValue: 'N/A',
            }
        ],
    },
    {
        name: 'Roll',
        description: 'Rolls a random number.',
        category: 'misc',
        usage: 'roll [max] [min]',
        examples: [
            {
                text: 'roll',
                description: 'Rolls a random number between 1 and 100'
            },
            {
                text: 'roll 100 50',
                description: 'Rolls a random number between 50 and 100'
            }
        ],
        aliases: ['rng', 'randomnumber', 'randomnumbergenerator', 'pickanumber', 'pickanum'],
        args: [
            {
                name: 'max',
                type: 'integer',
                required: false,
                description: 'The maximum number to roll',
                format: ['foo',],
                defaultValue: '100',
            },
            {
                name: 'min',
                type: 'integer',
                required: false,
                description: 'The minimum number to roll',
                format: ['bar',],
                defaultValue: '1',
            }
        ]
    },
    {
        name: 'CheckPerms',
        description: 'Checks the permissions of the user.',
        category: 'admin',
        usage: 'checkperms [user]',
        examples: [
            {
                text: 'checkperms @SSoB',
                description: 'Checks the permissions of the user @SSoB'
            }
        ],
        aliases: ['perms'],
        args: [
            userAdmin,
        ]
    },
    {
        name: 'Clear',
        description: 'Clears cached data within the bot',
        usage: 'clear <arg>',
        category: 'admin',
        examples: [],
        aliases: [],
        args: [
            {
                name: 'arg',
                type: 'integer/string',
                required: false,
                description: 'the types of files to clear (read the options section)',
                options: ['normal', 'all (only cmd data)', 'trueall', 'map', 'users', 'previous', 'pmaps', 'pscores', 'pusers', 'errors', 'graph'],
                format: ['foo',],
                defaultValue: 'temporary files only',
            }
        ]
    },
    {
        name: 'Debug',
        description: 'Runs a debugging command.',
        category: 'admin',
        usage: 'debug <type> [arg]',
        examples: [
            {
                text: 'debug commandfile 1',
                description: 'Returns all files associated with the command matching ID 1'
            },
            {
                text: 'debug commandfiletype map',
                description: 'Returns all files associated with the command "map"'
            },
            {
                text: 'debug servers',
                description: 'Returns a list of all guilds the bot is in'
            },
            {
                text: 'debug channels',
                description: 'Returns a list of all channels in the current guild'
            },
            {
                text: 'debug users',
                description: 'Returns a list of all members in the current guild'
            },
            {
                text: 'debug forcetrack',
                description: 'Forces the osu!track to run a cycle (takes a minute to complete)'
            },
            {
                text: 'debug curcmdid',
                description: 'Returns the current command\'s ID'
            },
            {
                text: 'debug logs',
                description: 'Returns the logs associated with the current guild'
            },
            {
                text: 'debug clear all',
                description: 'Deletes all command-related files cached'
            },
            {
                text: 'debug maps name',
                description: 'Returns all maps stored in the cache, and lists them by name'
            },
        ],
        aliases: [],
        args: [
            {
                name: 'type',
                type: 'string',
                required: false,
                description: 'The type of debug to perform',
                options: ['commandfile', 'commandfiletype', 'servers', 'channels', 'users', 'forcetrack', 'curcmdid', 'logs', 'clear', 'maps', 'ls', 'memory'],
                format: ['foo',],
                defaultValue: 'list options',
            }, {
                name: 'arg',
                type: 'integer/string',
                required: false,
                description: 'commandfile -> the id of the command to search for\ncommandfiletype -> the name of the command to search\nlogs -> the ID of the guild to send logs from',
                options: ['normal', 'all (only cmd data)', 'trueall', 'map', 'users', 'previous', 'pmaps', 'pscores', 'pusers', 'errors', 'graph'],
                format: ['bar',],
                defaultValue: 'commandfile -> latest command\ncommandfiletype -> list options\nlogs -> current server',
            }
        ]
    },
    {
        name: 'Find',
        description: 'Finds details of a user/guild/channel/role/emoji/sticker.',
        usage: 'find <type> <ID>',
        category: 'admin',
        examples: [
            {
                text: 'find user 777125560869978132',
                description: 'Returns info for user with id 777125560869978132'
            }
        ],
        aliases: ['get'],
        args: [
            {
                name: 'type',
                type: 'string',
                required: true,
                description: 'The type of info to fetch',
                options: ['user', 'guild', 'channel', 'role', 'emoji', 'sticker'],
                format: ['foo',],
                defaultValue: 'N/A',
            },
            {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'The ID to fetch',
                format: ['bar',],
                defaultValue: 'N/A',
            }
        ]
    },
    {
        name: 'LeaveGuild',
        description: 'Makes the bot leave a guild.',
        usage: 'leaveguild [guild]',
        category: 'admin',
        examples: [
            {
                text: 'leaveguild 1234567890',
                description: 'Makes the bot leave the guild with the id 1234567890'
            },
        ],
        aliases: ['leave'],
        args: [
            {
                name: 'guild',
                type: 'integer',
                required: false,
                description: 'The id of the guild to leave',
                format: ['foo',],
                defaultValue: 'the guild the command was sent in',
            }
        ]
    },
    {
        name: 'Prefix',
        description: 'Set\'s the prefix of the current server.',
        usage: 'prefix [prefix]',
        category: 'admin',
        examples: [
            {
                text: 'prefix !',
                description: 'Sets the prefix to "!"'
            }
        ],
        aliases: [],
        args: [
            {
                name: 'prefix',
                type: 'string',
                required: false,
                description: 'The prefix to set',
                format: ['foo',],
                defaultValue: 'N/A',
            }
        ]
    },
    {
        name: 'Servers',
        description: 'Shows the servers the bot is in.',
        usage: 'servers',
        category: 'admin',
        aliases: [],
    },
];