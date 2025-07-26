import Discord from 'discord.js';
import * as fs from 'fs';
import * as helper from '../../helper';
import * as log from '../../tools/log';
import { Command } from '../command';

export class Clear extends Command {
    declare protected params: {
        type: string;
    };
    constructor() {
        super();
        this.name = 'Clear';
        this.params = {
            type: ''
        };
    }
    async setParamsMsg() {
        this.params.type = this.input?.args[0];
    }
    async execute() {
        await this.setParams();
        this.logInput();
        // do stuff
        let embed = new Discord.EmbedBuilder()
            .setTitle('Clearing cache');

        embed = this.clearCache(this.params.type, embed);
        this.ctn.embeds = [embed];
        this.send();
    }
    clearCache(type: string, embed: Discord.EmbedBuilder) {
        switch (type) {
            case 'normal': default: { //clears all temprary files (cache/commandData)
                log.stdout(`manually clearing temporary files in ${helper.vars.path.cache}/commandData/`);
                const curpath = `${helper.vars.path.cache}/commandData`;
                const files = fs.readdirSync(curpath);
                for (const file of files) {
                    const keep = ['Approved', 'Ranked', 'Loved', 'Qualified'];
                    if (!keep.some(x => file.includes(x))) {
                        fs.unlinkSync(`${curpath}/` + file);
                        log.stdout(`Deleted file: ${curpath}/` + file);
                    }
                }
                embed.setDescription(`Clearing temporary files in ./cache/commandData/\n(ranked/loved/approved maps are kept)`);
            }
                break;
            case 'all': { //clears all files in commandData
                log.stdout(`manually clearing all files in ${helper.vars.path.cache}/commandData/`);
                const curpath = `${helper.vars.path.cache}/commandData`;
                const files = fs.readdirSync(curpath);
                for (const file of files) {
                    fs.unlinkSync(`${curpath}/` + file);
                    log.stdout(`Deleted file: ${curpath}/` + file);
                }
                embed.setDescription(`Clearing all files in ./cache/commandData/`);
            }
                break;
            case 'trueall': { //clears everything in cache
                embed = this.clearCache('all', embed);
                embed = this.clearCache('errors', embed);
                embed = this.clearCache('params', embed);
                embed.setDescription(`Clearing all files in ./cache/ and ./files/maps`);
            }
                break;
            case 'errors': { //clears all errors
                log.stdout(`manually clearing all err files in ${helper.vars.path.cache}/errors/`);
                const curpath = `${helper.vars.path.cache}/errors`;
                const files = fs.readdirSync(curpath);
                for (const file of files) {
                    fs.unlinkSync(`${curpath}/` + file);
                    log.stdout(`Deleted file: ${curpath}/` + file);
                }
                embed.setDescription(`Clearing error files in ./cache/errors/`);
            }
                break;
            case 'params': {
                log.stdout(`manually clearing all param files in ${helper.vars.path.cache}/params/`);
                const curpath = `${helper.vars.path.cache}/params`;
                const files = fs.readdirSync(curpath);
                for (const file of files) {
                    fs.unlinkSync(`${curpath}/` + file);
                    log.stdout(`Deleted file: ${curpath}/` + file);
                }
                embed.setDescription(`Clearing param files in ./cache/params/`);
            }
            case 'help': {
                embed.setDescription(
                    [
                        ['help', 'show this list'],
                        ['normal', 'clears all temporary files (maps with leaderboard are kept)'],
                        ['all', 'clears all files in command cache'],
                        ['errors', 'clear cached errors'],
                        ['params', 'clear command params (such as sorting order, filters etc.)'],
                    ].map(x => `**${x[0]}**: ${x[1]}`).join('\n') + '\n'
                    + '* previous files store the data of the last object used in that given server/guild'
                );
            }
                break;
        }
        return embed;
    }
}