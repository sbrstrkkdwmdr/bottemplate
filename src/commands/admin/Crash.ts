import * as log from '../../tools/log';
import { Command } from '../command';

export class Crash extends Command {
    declare protected params: {};
    constructor() {
        super();
        this.name = 'Crash';
    }
    async execute() {
        await this.setParams();
        this.logInput(true);
        // do stuff
        this.ctn.content = 'executing crash command...';
        this.send();
        setTimeout(() => {
            log.stdout(`executed crash command by ${this?.commanduser?.id} - ${this?.commanduser?.username}`);
            process.exit(1);
        }, 1000);
    }
}