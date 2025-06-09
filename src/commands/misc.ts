import Discord from 'discord.js';
import * as helper from '../helper.js';
import * as bottypes from '../types/bot.js';
import { Command } from './command.js';

export class Roll extends Command {
    declare protected args: {
        maxNum: number;
        minNum: number;
    };
    constructor() {
        super();
        this.name = 'Roll';
        this.args = {
            maxNum: 100,
            minNum: 0,
        };
    }
    async setArgsMsg() {
        this.args.maxNum = parseInt(this.input.args[0]);
        this.args.minNum = parseInt(this.input.args[1]);
        if (isNaN(this.args.maxNum) || !this.input.args[0]) {
            this.args.maxNum = 100;
        }
        if (isNaN(this.args.minNum) || !this.input.args[1]) {
            this.args.minNum = 0;
        }
    }
    async setArgsInteract() {
        const interaction = this.input.interaction as Discord.ChatInputCommandInteraction;
        this.args.maxNum = interaction.options.getNumber('max') ?? this.args.maxNum;
        this.args.minNum = interaction.options.getNumber('min') ?? this.args.minNum;
    }
    async execute() {
        await this.setArgs();
        this.logInput();
        // do stuff

        if (isNaN(this.args.maxNum)) {
            this.args.maxNum = 100;
        }
        if (isNaN(this.args.minNum)) {
            this.args.minNum = 0;
        }
        const eq = Math.floor(Math.random() * (this.args.maxNum - this.args.minNum)) + this.args.minNum;
        this.ctn.content = eq + '';
        this.send();
    }
}