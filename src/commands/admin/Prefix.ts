import * as fs from 'fs';
import * as helper from '../../helper';
import * as checks from '../../tools/checks';
import { Command } from '../command';

export class Prefix extends Command {
    declare protected params: {
        newPrefix: string;
    };
    constructor() {
        super();
        this.name = 'Prefix';
        this.params = {
            newPrefix: null
        };
    }
    async setParamsMsg() {
        this.params.newPrefix = this.input.args.join(' ');
    }

    async execute() {
        await this.setParams();
        this.logInput();
        // do stuff
        if (typeof this.params.newPrefix != 'string' || this.params.newPrefix.length < 1 || !(checks.isAdmin(this.commanduser.id, this.input.message?.guildId,) || checks.isOwner(this.commanduser.id))) {
            this.ctn.content = `The current prefix is \`${helper.vars.config.prefix}\``;
        } else {
            helper.vars.config.prefix = this.params.newPrefix;
            this.ctn.content = `Prefix set to \`${this.params.newPrefix}\``;
            const configpath = helper.vars.path.precomp + '/config/config.json'
            fs.writeFileSync(configpath, JSON.stringify(helper.vars.config, null, 1));
        }

        this.send();
    }
}