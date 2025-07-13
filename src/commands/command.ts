import * as Discord from 'discord.js';
import moment from 'moment';
import * as helper from '../helper';
import * as commandTools from '../tools/commands';
import * as formatters from '../tools/formatters';
import * as log from '../tools/log';
import * as other from '../tools/other';

export abstract class InputHandler {
    protected selected: Command;
    protected overrides: helper.bottypes.overrides = {};
    abstract onMessage(message: Discord.Message): Promise<void>;
    abstract onInteraction(interaction: Discord.Interaction): Promise<void>;
}

/**
 * base command class
 * 
 * copy template class below to implement for new commands
 */
export class Command {
    #name: string;
    protected argParser: ArgsParser;
    protected set name(input: string) {
        this.#name = input[0] == input[0].toUpperCase() ? input : formatters.toCapital(input);
    }
    protected get name() { return this.#name; }
    protected commanduser: Discord.User | Discord.APIUser;
    /**
     * object for storing message content, embeds, etc.
     * 
     * use `this.send` to send messages
     */
    protected ctn: {
        content?: string,
        embeds?: (Discord.EmbedBuilder | Discord.Embed)[],
        files?: (string | Discord.AttachmentBuilder | Discord.Attachment)[],
        components?: Discord.ActionRowBuilder<any>[],
        ephemeral?: boolean,
        react?: boolean,
        edit?: boolean,
        editAsMsg?: boolean,
    };
    /**
     * user-defined parameters
     * (page = 2 etc.)
     * 
     * make sure to set the default values in the constructor
     */
    protected params: helper.tooltypes.Dict;

    /**
     * stores event message/interaction object, overrides, command ID etc. 
     */
    protected input: helper.bottypes.commandInput;

    constructor() {
        this.voidcontent();
    }
    /**
     * sets input and arg parser
     */
    setInput(input: helper.bottypes.commandInput) {
        this.input = input;
        this.argParser = new ArgsParser(this.input.args);
    }
    /**
     * empties all values in `this.ctn`
     */
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
    /**
     * uses the appropriate params setter methods (setParamsMsg for message events, setParamsInteract for interactions)
     * 
     * to actually parse user input, modify the setParams{type} methods
     */
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
    /**
     * parse user input from messages
     * 
     * see `setParam`
     */
    async setParamsMsg() {
    }
    /**
     * for message params only
     * 
     * @param defaultValue - what to return if no flags are found
     * @param flags - what flags to search for for this parameter
     * @param type - string, number, boolean
     * @param typeParams - type-specific settings
     * @param typeParams.bool_setValue - what to set the param to (bool only)
     * @param typeParams.number_isInt - is this param an integer value (number only)
     * @param typeParams.string_isMultiple - paramater can be multiple words enclosed by double-quotes (string only)
     * 
     * ```
     * this.input.args = ['-p', '55.3',]
     * const page = setParam(null, flags: ['-p'], 'number', { number_isInt:true });
     * // => 55
     * 
     * this.input.args = ['-p', 'waow',]
     * const page = setParam(null, flags: ['-p'], 'number', { number_isInt:true });
     * // => NaN
     * ```
     */
    protected setParam(defaultValue: any, flags: string[], type: 'string' | 'number' | 'bool', typeParams: {
        bool_setValue?: any,
        number_isInt?: boolean,
        string_isMultiple?: boolean,
    }) {
        flags = this.setParamCheckFlags(flags);
        switch (type) {
            case 'string': {
                let temparg = this.argParser.getParam(flags);
                if (temparg) defaultValue = temparg;
            }
                break;
            case 'number': {
                let temparg = this.argParser.getParam(flags);
                if (temparg) defaultValue =
                    typeParams.number_isInt ?
                        parseInt(temparg) :
                        +temparg;
            }
                break;
            case 'bool': {
                let temparg = this.argParser.getParamBool(flags);
                if (temparg) defaultValue = typeParams?.bool_setValue ?? true;
            }
                break;
        }
        return defaultValue;
    };
    /**
     * 
     * @param defaultValue - what to return if no args are found
     * @param args - list of flags and values
     * @param args.set - set the param to this value 
     * @param args.flags - what flags to search for 
     * 
     * example: 
     * ```
     * // return 'osu' if no args found
     * // return 'taiko' if '-t' or '-taiko' are found
     * // etc...
     * this.params.mode = this.setParamBoolList('osu',
     *      { set: 'osu', flags: ['-o', '-osu', '-std'] },
     *      { set: 'taiko', flags: ['-t', '-taiko'] },
     *      { set: 'fruits', flags: ['-f', '-fruits', '-ctb', '-catch'] },
     *      { set: 'mania', flags: ['-m', '-mania'] }
     *  );
     * ```
     */
    protected setParamBoolList(defaultValue: any, ...args: { set: any, flags: string[]; }[]) {
        for (const arg of args) {
            const temp = this.setParam(false, arg.flags, 'bool', { bool_setValue: arg.set });
            if (temp) {
                return temp;
            }
        }
        return defaultValue;
    }
    private setParamCheckFlags(flags: string[]) {
        if (flags.length == 0) return [];
        const nf: string[] = [];
        for (const flag of flags) {
            if (!flag.startsWith('-')) {
                nf.push('-' + flag.toLowerCase());
            } else {
                nf.push(flag.toLowerCase());
            }
        }
        return nf;
    }
    protected setParamPage() {
        this.params.page = this.setParam(this.params.page, helper.argflags.pages, 'number', { number_isInt: true });
    }
    /**
     * set interaction parameters
     * 
     * ```
     * this.params.page = interaction.options.getInteger("page");
     * ```
     */
    async setParamsInteract() {
    }
    async setParamsBtn() {
    }
    async setParamsLink() {
    }
    /**
     * logs command name, ID, time, params, etc.
     */
    logInput(skipKeys: boolean = false) {
        let keys = [];
        if (!skipKeys) {
            keys = Object.entries(this.params).map(x => {
                return {
                    name: formatters.toCapital(x[0]),
                    value: x[1]
                };
            });
        }
        log.commandOptions(
            keys,
            this.input.id,
            this.name,
            this.input.type,
            this.commanduser,
            this.input.message,
            this.input.interaction,
        );
    }
    /**
     * check for override params and set them accordingly
     * 
     * ```
     * // check for page override and set it if it exists
     * this.setParamOverride('page'); 
     * 
     * ```
     */
    getOverrides() { }
    /**
     * this.params[pKey] = this.input.overrides[oKey]
     */
    protected setParamOverride(paramKey: string, overrideKey?: string, type?: 'string' | 'number') {
        const oKey = overrideKey ?? paramKey;
        if (this.input.overrides[oKey]) {
            this.params[paramKey] = this.forceType(this.input.overrides[oKey], type);
        }
    }
    private forceType(value: any, type: 'string' | 'number') {
        switch (type) {
            case 'string':
                value = value + '';
                break;
            case 'number':
                value = +value;
                break;
        }
        return value;
    }
    async execute() {
        this.ctn.content = 'No execution method has been set';
        this.send();
    }
    /**
     * sends `this.ctn`
     */
    async send() {
        await commandTools.sendMessage({
            type: this.input.type,
            message: this.input.message,
            interaction: this.input.interaction,
            args: this.ctn,
        }, this.input.canReply);
    }
}

export class ArgsParser {
    private args: string[];
    private used: Set<number>;
    constructor(args: string[]) {
        this.args = args.map(x => x.toLowerCase());
        this.used = new Set();
    }
    /**
     * assisted by ChatGPT
     * 
     * get the value of params matching given flags
     * 
     * ```
     * this.args = ['-p', '5'];
     * getParam(['-p','-page']); // => '5'
     * ```
     */
    getParam(flags: string[]) {
        for (let i = 0; i < this.args.length; i++) {
            if (flags.includes(this.args[i]) && !this.used.has(i)) {
                this.used.add(i);

                const values: string[] = [];
                let collecting = false;

                for (let j = i + 1; j < this.args.length; j++) {
                    const arg = this.args[j];
                    if (this.used.has(j)) continue;

                    if (!collecting && arg.startsWith('"')) {
                        collecting = true;
                        values.push(arg.slice(1));
                        this.used.add(j);
                    } else if (collecting && arg.endsWith('"')) {
                        values.push(arg.slice(0, -1));
                        this.used.add(j);
                        break;
                    } else if (collecting) {
                        values.push(arg);
                        this.used.add(j);
                    } else if (!arg.startsWith('-')) {
                        values.push(arg);
                        this.used.add(j);
                        break;
                    } else {
                        break;
                    }
                }

                return values.length > 0 ? values.join(' ') : null;
            }
        }

        return null;
    }
    /**
     * get the value of params matching given flags
     * 
     * ```
     * this.args = ['-parse', '5', 'woaw'];
     * getParamBool(['-parse','-p']); // => true
     * ```
     */
    getParamBool(flags: string[]) {
        for (let i = 0; i < this.args.length; i++) {
            if (flags.includes(this.args[i])) {
                this.used.add(i);
                return true;
            }
        }
        return false;
    }
    /**
     * check if a param exists in args
     * 
     * unlike `getParamBool()`, this doesn't update `this.used`
     * 
     * ```
     * this.args = ['-parse', '5', 'woaw'];
     * getParamBool(['-parse','-p']); // => true
     * ```
     */
    paramExists(flags: string[]) {
        for (let i = 0; i < this.args.length; i++) {
            if (flags.includes(this.args[i])) {
                return true;
            }
        }
        return false;
    }
    paramFixNumber(value: any): number {
        if (value) return +value;
        return null;
    }
    paramFixInt(value: any): number {
        if (value) return Math.floor(+value);
        return null;
    }
    /**
     * assisted by ChatGPT
     * 
     * flags can be formatted as `-foo` or `*{param}*`
     * 
     * example of how to use:
     * ```
     * input.args = ['-u', '152'];
     * getParamFlexible(['-u', 'osu.ppy.sh/u/{param}']); // 152
     * 
     * input.args = ['osu.ppy.sh/u/34'];
     * getParamFlexible(['-u', 'osu.ppy.sh/u/{param}']); // 34
     * 
     * input.args = ['osu.ppy.sh/users/15222484/mania'];
     * getParamFlexible(['-u', 'osu.ppy.sh/users/{param}/*']); // 15222484
     * ```
     */
    getParamFlexible(flagsOrPatterns: string[]) {
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            if (this.used.has(i)) continue;

            for (const pattern of flagsOrPatterns) {
                // Case 1: CLI-style flag
                if (!pattern.includes('{')) {
                    if (arg === pattern) {
                        this.used.add(i);
                        const value = this.args[i + 1];
                        if (value && !value.startsWith('-')) {
                            this.used.add(i + 1);
                            return value.replace(/^"|"$/g, '');
                        }
                        return null;
                    }
                }

                // Case 2: Pattern with {param} and wildcards
                else {
                    const regex = new RegExp(
                        '^' +
                        pattern
                            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape regex characters
                            .replace(/\\\*/g, '.*')                // turn \* into .*
                            .replace(/\\{param\\}/g, '([^/#?]+)') + // capture {param}
                        '$'
                    );

                    const match = arg.match(regex);
                    if (match) {
                        this.used.add(i);
                        return match[1];
                    }
                }
            }
        }

        return null;
    }
    /**
     * get remaining args that haven't already been parsed
     */
    getRemaining(): string[] {
        return this.args.filter((_, i) => !this.used.has(i));
    }

    /**
     * assisted by ChatGPT
     * 
     * parses link-patterns
     * 
     * return object depends on the pattern given
     * 
     * example:
     * 
     * ```
     * const args = ['osu.ppy.sh/beatmapsets/12#osu/52']
     * getLink('osu.ppy.sh/beatmapsets/{set}#{mode}/{map}');
     * // => 
     * // {
     * // set: '12',
     * // mode: 'osu',
     * // map: '52',
     * // }
     * ```
     */
    getLink(pattern: string): helper.tooltypes.Dict | null {
        const paramNames: string[] = [];

        let rawRegex = pattern.replace(/{(\w+)}/g, (_, name) => {
            paramNames.push(name);
            return '<<<CAPTURE>>>';
        });

        rawRegex = rawRegex.replace(/([.+?^$()|[\]\\])/g, '\\$1');

        const regexPattern = rawRegex.replace(/<<<CAPTURE>>>/g, '([^/#?]+)');

        const regex = new RegExp('^' + regexPattern + '$');
        for (let i = 0; i < this.args.length; i++) {
            if (this.used.has(i)) continue;

            const arg = this.args[i];
            const match = arg.match(regex);
            if (match) {
                this.used.add(i);

                const result: helper.tooltypes.Dict[] = paramNames.map((name, index) => ({
                    [name]: match[index + 1],
                }));

                return this.kvToDict(result as helper.tooltypes.DictEntry[]);
            }
        }

        return null;
    }
    kvToDict(array: { (key: string): any; }[]) {
        const dictionary: helper.tooltypes.Dict = {};
        for (const elem of array) {
            const key = Object.keys(elem)[0];
            dictionary[key] = elem[key];
        }
        return dictionary;
    }
}