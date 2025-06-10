import * as Discord from 'discord.js';
import moment from 'moment';
import * as helper from '../helper.js';
import * as bottypes from '../types/bot.js';
import * as tooltypes from '../types/tools.js';

/**
 * base command class
 * 
 * copy template class below to implement for new commands
 */
export class Command {
    #name: string;
    protected set name(input: string) {
        this.#name = helper.tools.formatter.toCapital(input);
    }
    protected get name() { return this.#name; }
    protected commanduser: Discord.User | Discord.APIUser;
    protected ctn: {
        content?: string,
        embeds?: (Discord.EmbedBuilder | Discord.Embed)[],
        files?: (string | Discord.AttachmentBuilder | Discord.Attachment)[],
        components?: Discord.ActionRowBuilder<any>[],
        /**
         * (interaction only) reply is only visible to the user
         */
        ephemeral?: boolean,
        react?: boolean,
        edit?: boolean,
        editAsMsg?: boolean,
    };
    protected params: { [id: string]: any; };
    protected input: bottypes.commandInput;
    constructor() {
        this.voidcontent();
    }
    setInput(input: bottypes.commandInput) {
        this.input = input;
    }
    voidcontent() {
        this.ctn = {
            content: undefined,
            embeds: [],
            files: [],
            components: [],
            ephemeral: false,
            react: undefined,
            edit: undefined,
            editAsMsg: undefined,
        };
    }
    async setParams() {
        switch (this.input.type) {
            case 'message':
                this.commanduser = this.input.message.author;
                await this.setParamsMsg();
                break;
            case 'interaction':
                this.commanduser = this.input.interaction?.member?.user ?? this.input.interaction?.user;
                await this.setParamsInteract();
                break;
            case 'button':
                this.commanduser = this.input.interaction?.member?.user ?? this.input.interaction?.user;
                await this.setParamsBtn();
                break;
            case 'link':
                this.commanduser = this.input.message.author;
                await this.setParamsLink();
                break;
        }
    }
    async setParamsMsg() {
    }
    async setParamsInteract() {
    }
    async setParamsBtn() {
    }
    async setParamsLink() {
    }
    logInput(skipKeys: boolean = false) {
        let keys = [];
        if (!skipKeys) {
            keys = Object.entries(this.params).map(x => {
                return {
                    name: helper.tools.formatter.toCapital(x[0]),
                    value: x[1]
                };
            });
        }
        helper.tools.log.commandOptions(
            keys,
            this.input.id,
            this.name,
            this.input.type,
            this.commanduser,
            this.input.message,
            this.input.interaction,
        );
    }
    getOverrides() { }
    async execute() {
        this.ctn.content = 'No execution method has been set';
        this.send();
    }
    async send() {
        await helper.tools.commands.sendMessage({
            type: this.input.type,
            message: this.input.message,
            interaction: this.input.interaction,
            args: this.ctn,
        }, this.input.canReply);
    }
}

class TEMPLATE extends Command {
    declare protected params: {
        xyzxyz: string;
    };
    constructor() {
        super();
        this.name = 'TEMPLATE';
        this.params = {
            xyzxyz: ''
        };
    }
    async setParamsMsg() {
    }
    async setParamsInteract() {
        const interaction = this.input.interaction as Discord.ChatInputCommandInteraction;
    }
    async setParamsBtn() {
        if (!this.input.message.embeds[0]) return;
        const interaction = (this.input.interaction as Discord.ButtonInteraction);
        const temp = helper.tools.commands.getButtonArgs(this.input.id);
        // @ts-expect-error type error does not exist on type params
        if (temp?.error) {
            interaction.followUp({
                content: helper.vars.errors.paramFileMissing,
                flags: Discord.MessageFlags.Ephemeral,
                allowedMentions: { repliedUser: false }
            });
            helper.tools.commands.disableAllButtons(this.input.message);
            return;
        }
    }
    async setParamsLink() {
        const messagenohttp = this.input.message.content.replace('https://', '').replace('http://', '').replace('www.', '');
    }
    async execute() {
        await this.setParams();
        this.logInput();
        // do stuff
        this.ctn.content = 'Test output!';
        this.send();
    }
}