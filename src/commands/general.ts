import Discord from 'discord.js';
import * as helper from '../helper.js';
import * as bottypes from '../types/bot.js';

import moment from 'moment';
import pkgjson from '../../package.json';
import { Command } from './command.js';

export class Help extends Command {
    declare protected params: {
        rdm: boolean;
        commandfound: boolean;
        commandCategory: string;
        command: string;
    };
    constructor() {
        super();
        this.name = 'Help';
        this.params = {
            rdm: false,
            commandfound: false,
            commandCategory: 'default',
            command: undefined,
        };
    }
    async setParamsMsg() {
        this.commanduser = this.input.message.author;
        this.params.command = this.input.args[0];
        if (!this.input.args[0]) {
            this.params.command = null;
        }
    }
    async setParamsInteract() {
        const interaction = this.input.interaction as Discord.ChatInputCommandInteraction;
        this.commanduser = interaction?.member?.user ?? interaction?.user;
        this.params.command = interaction.options.getString('command');
    }
    async setParamsBtn() {
        if (!this.input.message.embeds[0]) return;
        const interaction = (this.input.interaction as Discord.ButtonInteraction);
        this.commanduser = interaction?.member?.user ?? this.input.interaction?.user;
        if (this.input.buttonType == 'Random') {
            this.params.rdm = true;
        }
        switch (this.input.buttonType) {
            case 'Random':
                this.params.rdm = true;
                break;
            case 'Detailed':
                this.params.command = null;
                break;
        }
        const curembed: Discord.Embed = this.input.message.embeds[0];
        if (this.input.buttonType == 'Detailed' && curembed.description.includes('Prefix is')) {
            this.params.command = 'list';
        }
    }
    getOverrides(): void {
        if (!this.input.overrides) return;
        if (this.input.overrides?.ex != null) {
            this.params.command = this.input?.overrides?.ex + '';
        }
    }
    async execute() {
        await this.setParams();
        this.getOverrides();
        this.logInput();
        // do stuff
        if (this.params.rdm == true) {
            this.params.command = this.rdmp('cmds');
        }
        const buttons = new Discord.ActionRowBuilder()
            .setComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`${helper.vars.versions.releaseDate}-Detailed-${this.name}-${this.commanduser.id}-${this.input.id}`)
                    .setStyle(helper.vars.buttons.type.current)
                    .setEmoji(helper.vars.buttons.label.main.detailed)
            );

        this.getemb();

        const inputMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`${helper.vars.versions.releaseDate}-SelectMenu1-help-${this.commanduser.id}-${this.input.id}`)
            .setPlaceholder('Select a command');

        const selectCategoryMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`${helper.vars.versions.releaseDate}-SelectMenu2-help-${this.commanduser.id}-${this.input.id}`)
            .setPlaceholder('Select a command category')
            .setOptions(
                new Discord.StringSelectMenuOptionBuilder()
                    .setEmoji('📜' as Discord.APIMessageComponentEmoji)
                    .setLabel('General')
                    .setValue('CategoryMenu-gen'),
                new Discord.StringSelectMenuOptionBuilder()
                    .setEmoji('🤖' as Discord.APIMessageComponentEmoji)
                    .setLabel('Admin')
                    .setValue('CategoryMenu-admin'),
                new Discord.StringSelectMenuOptionBuilder()
                    .setEmoji('❓' as Discord.APIMessageComponentEmoji)
                    .setLabel('Misc')
                    .setValue('CategoryMenu-misc'),
            );
        this.ctn.components.push(
            new Discord.ActionRowBuilder()
                .setComponents(selectCategoryMenu)
        );
        let curpick: bottypes.commandInfo[] = helper.tools.commands.getCommands(this.params.commandCategory);

        if (curpick.length == 0) {
            curpick = helper.tools.commands.getCommands('general');
        }
        if (this.params.commandfound == true) {
            for (let i = 0; i < curpick.length && i < 25; i++) {
                inputMenu.addOptions(
                    new Discord.StringSelectMenuOptionBuilder()
                        .setEmoji('📜')
                        .setLabel(`#${i + 1}`)
                        .setDescription(curpick[i]?.name ?? '_')
                        .setValue(curpick[i].name)
                );

            }
            this.ctn.components.push(
                new Discord.ActionRowBuilder()
                    .setComponents(inputMenu));
        }
        this.send();
    }
    commandEmb(command: bottypes.commandInfo, embed) {
        let usetxt = '';
        if (command.usage) {
            usetxt += `\`${helper.vars.config.prefix}${command.usage}\``;
        }

        const commandaliases = command.aliases && command.aliases.length > 0 ? command.aliases.join(', ') : 'none';
        const commandexamples = command.examples && command.examples.length > 0 ? command.examples.slice(0, 5).map(x => x.text).join('\n').replaceAll('PREFIXMSG', helper.vars.config.prefix) : 'none';

        embed.setTitle("Command info for: " + command.name)
            .setURL(`https://sbrstrkkdwmdr.github.io/projects/ssob_docs/commands.html`)
            .setDescription("To see full details about this command, visit [here](https://sbrstrkkdwmdr.github.io/projects/ssob_docs/commands.html)\n\n" + command.description + "\n")
            .addFields([
                {
                    name: 'Usage',
                    value: usetxt,
                    inline: false,
                },
                {
                    name: 'Aliases',
                    value: commandaliases,
                    inline: false
                },
                {
                    name: 'Examples',
                    value: commandexamples,
                    inline: false
                },
            ]);
    }
    /**
     *  TDL - fix this
     *  too long and complex
     *  make into smaller separate functions
     * */
    getemb() {
        if (this.params.command == 'list') {
            const commandlist: {
                category: string;
                cmds: string[];
            }[] = [];

            for (const cmd of helper.vars.commandData.cmds) {
                if (commandlist.map(x => x.category).includes(cmd.category)) {
                    const idx = commandlist.map(x => x.category).indexOf(cmd.category);
                    commandlist[idx].cmds.push(cmd.name);
                } else {
                    commandlist.push({
                        category: cmd.category,
                        cmds: [cmd.name],
                    });
                }
            }

            const clembed = new Discord.EmbedBuilder()
                .setColor(helper.vars.colours.embedColour.info.dec)
                .setTitle('Command List')
                .setURL('https://sbrstrkkdwmdr.github.io/projects/ssob_docs/commands')
                .setDescription('use `/help <command>` to get more info on a command')
                .addFields(
                    commandlist.map(x => {
                        return {
                            name: x.category.replace('_', ' '),
                            value: x.cmds.map(x => '`' + x + '`').join(', ')
                        };
                    })
                )
                .setFooter({
                    text: 'Website: https://sbrstrkkdwmdr.github.io/projects/ssob_docs/commands | Github: https://github.com/sbrstrkkdwmdr/sbrbot/tree/ts'
                });
            this.ctn.embeds = [clembed];
            this.params.commandCategory = 'default';
        } else if (this.params.command != null) {
            const fetchcmd = this.params.command;
            const commandInfo = new Discord.EmbedBuilder()
                .setColor(helper.vars.colours.embedColour.info.dec);
            if (helper.tools.commands.getCommand(fetchcmd)) {
                const res = helper.tools.commands.getCommand(fetchcmd);
                this.params.commandfound = true;
                this.params.commandCategory = res.category;
                this.commandEmb(res, commandInfo);
            } else if (this.params.command.toLowerCase().includes('category')) {
                let sp = this.params.command.toLowerCase().split('category')[1];
                if (sp == 'all') {
                    this.params.command = 'list';
                    this.getemb();
                } else {
                    let c = this.categorise(sp);
                    if (c != '') {
                        commandInfo
                            .setTitle(helper.tools.formatter.toCapital(sp) + " Commands")
                            .setDescription(c);
                        this.params.commandCategory = sp;
                    } else {
                        this.params.command = null;
                        this.getemb();
                        return;
                    }
                }
            }
            else {
                this.params.command = null;
                this.getemb();
                return;
            }

            this.ctn.embeds = [commandInfo];
        } else {
            this.ctn.embeds = [new Discord.EmbedBuilder()
                .setColor(helper.vars.colours.embedColour.info.dec)
                .setTitle('Help')
                .setURL('https://sbrstrkkdwmdr.github.io/projects/ssob_docs/commands')
                .setDescription(`Prefix is: MSGPREFIX
- Use \`MSGPREFIXhelp <command>\` to get more info on a command or \`/help list\` to get a list of commands
- \`MSGPREFIXhelp category<category>\` will list only commands from that category
- Arguments are shown as either <arg> or [arg]. Angled brackets "<arg>" are required and square brackets "[arg]" are optional.
- Argument values can be specified with \`-key value\` (eg. \`-page 3\`)
- Argument values with spaces (such as names) can be specified with quotes eg. "saber strike"
- You can use \`MSGPREFIXosuset\` to automatically set your osu! username and gamemode for commands such as \`recent\` (rs)
- Mods are specified with +[mods] (include), -mx [mods] (match exact) or -me [mods] (exclude). -mx overrides +[mods]
- Gamemode can be specified by using -(mode) in commands that support it (eg. -taiko)
`.replaceAll('MSGPREFIX', helper.vars.config.prefix))
                .setFooter({
                    text: 'Website: https://sbrstrkkdwmdr.github.io/projects/ssob_docs/commands | Github: https://github.com/sbrstrkkdwmdr/sbrbot/tree/ts'
                })];
            this.params.commandCategory = 'default';
        }
    }
    rdmp(w: string) {
        const fullyrando = Math.floor(Math.random() * helper.vars.commandData[w].length);
        return helper.vars.commandData.cmds[fullyrando].name;
    }
    categorise(type: string) {
        console.log(type);
        let desctxt = '';
        const cmds = helper.tools.commands.getCommands(type);
        for (let i = 0; i < cmds.length; i++) {
            desctxt += `\n\`${cmds[i].name}\`: ${cmds[i].description.split('.')[0]}`;
        }
        this.params.commandfound = true;
        if (desctxt.length > 4000) {
            desctxt = desctxt.slice(0, 3900);
            desctxt += "\n\nThe text has reached maximum length. See [here](https://sbrstrkkdwmdr.github.io/projects/ssob_docs/commands) for the rest of the commands";
        }
        return desctxt;
    }
}
export class Info extends Command {
    declare protected params: {};
    constructor() {
        super();
        this.name = 'Info';
    }
    async setParamsMsg() {
        this.commanduser = this.input.message.author;
    }
    async setParamsInteract() {
        const interaction = this.input.interaction as Discord.ChatInputCommandInteraction;
        this.commanduser = interaction?.member?.user ?? interaction?.user;
    }
    async execute() {
        await this.setParams();
        this.logInput(true);
        // do stuff
        const buttons: Discord.ActionRowBuilder = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel('Info')
                    .setURL('https://sbrstrkkdwmdr.github.io/projects/ssob_docs/')
                    .setStyle(Discord.ButtonStyle.Link)
            );

        const data = {
            deps: `Typescript: [${pkgjson.dependencies['typescript'].replace('^', '')}](https://www.typescriptlang.org/)
Discord.js: [${pkgjson.dependencies['discord.js'].replace('^', '')}](https://discord.js.org/#/docs)
rosu-pp: [${pkgjson.dependencies['rosu-pp-js'].replace('^', '')}](https://github.com/MaxOhn/rosu-pp-js)
Axios: [${pkgjson.dependencies['axios'].replace('^', '')}](https://github.com/axios/axios)
Sequelize: [${pkgjson.dependencies['sequelize'].replace('^', '')}](https://github.com/sequelize/sequelize/)
Chart.js: [${pkgjson.dependencies['chart.js'].replace('^', '')}](https://www.chartjs.org/)
sqlite3: [${pkgjson.dependencies['sqlite3'].replace('^', '')}](https://github.com/TryGhost/node-sqlite3)`,
            uptime: `${helper.tools.calculate.secondsToTime(helper.vars.client.uptime / 1000)}`,
            version: pkgjson.version,
            preGlobal: helper.vars.config.prefix.includes('`') ? `"${helper.vars.config.prefix}"` : `\`${helper.vars.config.prefix}\``,
            server: helper.vars.versions.serverURL,
            website: helper.vars.versions.website,
            creator: 'https://sbrstrkkdwmdr.github.io/',
            source: `https://github.com/sbrstrkkdwmdr/sbrbot/`,
            shards: helper.vars.client?.shard?.count ?? 1,
            guilds: helper.vars.client.guilds.cache.size,
            users: helper.vars.client.users.cache.size,

        };
        const Embed = new Discord.EmbedBuilder()
            .setColor(helper.vars.colours.embedColour.info.dec)
            .setTitle('Bot Information');
        if (this.input.args.length > 0) {
            ['uptime', 'server', 'website', 'timezone', 'version', 'v', 'dependencies', 'deps', 'source'];
            switch (this.input.args[0]) {
                case 'uptime':
                    Embed.setTitle('Total uptime')
                        .setDescription(data.uptime);
                    break;
                case 'version': case 'v':
                    Embed.setTitle('Bot version')
                        .setDescription(data.version);
                    break;
                case 'server':
                    Embed.setTitle('Bot server')
                        .setDescription(data.server);
                    break;
                case 'website':
                    Embed.setTitle('Bot website')
                        .setDescription(data.website);
                    break;
                case 'dependencies': case 'dep': case 'deps':
                    Embed.setTitle('Dependencies')
                        .setDescription(data.deps);
                    break;
                case 'source': case 'code':
                    Embed.setTitle('Source Code')
                        .setDescription(data.source);
                    break;
                default:
                    Embed.setDescription(`\`${this.input.args[0]}\` is an invalid argument`);
                    break;
            }
        } else {
            Embed
                .setFields([
                    {
                        name: 'Dependencies',
                        value: data.deps,
                        inline: true
                    },
                    {
                        name: 'Statistics',
                        value:
                            `
Uptime: ${data.uptime}
Shards: ${data.shards}
Guilds: ${data.guilds}
Users: ${data.users}`,
                        inline: true
                    }
                ])
                .setDescription(`
[Created by SaberStrike](${data.creator})
[Commands](${data.website})
Global prefix: ${data.preGlobal}
Bot Version: ${data.version}
`);
        }

        this.ctn.embeds = [Embed];
        this.ctn.components = [buttons];

        this.send();
    }
}
export class Invite extends Command {
    declare protected params: {};
    constructor() {
        super();
        this.name = 'Invite';
    }
    async execute() {
        await this.setParams();
        this.logInput(true);
        // do stuff
        this.ctn.content = helper.vars.versions.linkInvite;
        this.send();
    }
}
export class Ping extends Command {
    declare protected params: {};
    constructor() {
        super();
        this.name = 'Ping';
    }
    async execute() {
        await this.setParams();
        this.logInput(true);
        // do stuff
        const trueping = `${helper.tools.formatter.toCapital(this.input.type)} latency: ${Math.abs((this.input.message ?? this.input.interaction).createdAt.getTime() - new Date().getTime())}ms`;

        const pingEmbed = new Discord.EmbedBuilder()
            .setTitle('Pong!')
            .setColor(helper.vars.colours.embedColour.info.dec)
            .setDescription(`
    Client latency: ${helper.vars.client.ws.ping}ms
    ${trueping}`);
        const preEdit = new Date();

        switch (this.input.type) {
            case 'message':
                {
                    this.input.message.reply({
                        embeds: [pingEmbed],
                        allowedMentions: { repliedUser: false },
                        failIfNotExists: true
                    }).then((msg: Discord.Message | Discord.ChatInputCommandInteraction) => {
                        const timeToEdit = new Date().getTime() - preEdit.getTime();
                        pingEmbed.setDescription(`
            Client latency: ${helper.vars.client.ws.ping}ms
            ${trueping}
            ${helper.tools.formatter.toCapital(this.input.type)} edit latency: ${Math.abs(timeToEdit)}ms
            `);
                        helper.tools.commands.sendMessage({
                            type: this.input.type,
                            message: msg as Discord.Message,
                            interaction: msg as Discord.ChatInputCommandInteraction,
                            args: {
                                embeds: [pingEmbed],
                                edit: true,
                                editAsMsg: true,
                            }
                        }, this.input.canReply);
                    })
                        .catch();
                }
                break;
            case 'interaction': {
                this.input.interaction.reply({
                    embeds: [pingEmbed],
                    allowedMentions: { repliedUser: false },
                }).then((intRes: Discord.InteractionResponse) => {
                    const timeToEdit = new Date().getTime() - preEdit.getTime();
                    pingEmbed.setDescription(`
        Client latency: ${helper.vars.client.ws.ping}ms
        ${trueping}
        ${helper.tools.formatter.toCapital(this.input.type)} edit latency: ${Math.abs(timeToEdit)}ms
        `);
                    intRes.edit({
                        embeds: [pingEmbed]
                    });
                })
                    .catch();
            }
                break;
        }
    }
}
export class Stats extends Command {
    declare protected params: {};
    constructor() {
        super();
        this.name = 'Stats';
    }
    async execute() {
        await this.setParams();
        this.logInput(true);
        // do stuff
        const trueping = (this.input.message ?? this.input.interaction).createdAt.getTime() - new Date().getTime() + 'ms';

        const uptime = Math.round((new Date().getTime() - helper.vars.startTime.getTime()) / 1000);
        const uptimehours = Math.floor(uptime / 3600) >= 10 ? Math.floor(uptime / 3600) : '0' + Math.floor(uptime / 3600);
        const uptimeminutes = Math.floor((uptime % 3600) / 60) >= 10 ? Math.floor((uptime % 3600) / 60) : '0' + Math.floor((uptime % 3600) / 60);
        const uptimeseconds = Math.floor(uptime % 60) >= 10 ? Math.floor(uptime % 60) : '0' + Math.floor(uptime % 60);
        const upandtime = `Uptime: ${uptimehours}:${uptimeminutes}:${uptimeseconds}\nTimezone: ${moment(helper.vars.startTime).format('Z')}`;

        const totalusers: number = helper.vars.client.users.cache.size;
        // let totalusersnobots: Discord.Collection<any, Discord.User>;
        const totalguilds: number = helper.vars.client.guilds.cache.size;

        const Embed = new Discord.EmbedBuilder()
            .setTitle(`${helper.vars.client.user.username} stats`)
            .setDescription(
                `Client latency: ${Math.round(helper.vars.client.ws.ping)}ms
    Message Latency: ${trueping}
    ${upandtime}
    Guilds: ${totalguilds}
    Users: ${totalusers}
    Commands sent: ${helper.vars.id}
    Prefix: \`${helper.vars.config.prefix}\`
    Shards: ${helper.vars?.client?.shard?.count ?? 1}
    Current Shard:
    `
            );
        this.ctn.embeds = [Embed];
        this.send();
    }
}