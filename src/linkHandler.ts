import * as Discord from 'discord.js';
import fs from 'fs';
import https from 'https';
import { Command, InputHandler } from './commands/command';
import * as helper from './helper';
import * as checks from './tools/checks';
import * as commandTools from './tools/commands';
import * as formatters from './tools/formatters';

export class LinkHandler extends InputHandler {
    async onMessage(message: Discord.Message) {
        if (!(message.content.startsWith('http') || message.content.includes('osu.') || message.attachments.size > 0)) {
            return;
        }
        let canReply = true;
        if (!checks.botHasPerms(message, ['ReadMessageHistory'])) {
            canReply = false;
        }
        return;
        // this is just an example
        if(message.content.startsWith('https://sbrstrkkdwmdr/skins/')){
            this.overrides = {
                id: message.content.split('https://sbrstrkkdwmdr/skins/')[1]
            }
            this.selected = new Command();
            await this.runCommand(message);
        }
    }
    async onInteraction(interaction: Discord.Interaction) { }
    async runCommand(message: Discord.Message, tid?: number) {
        this.selected.setInput({
            message,
            interaction: null,
            args: [],
            date: new Date(),
            id: tid ?? commandTools.getCmdId(),
            overrides: {},
            canReply: true,
            type: "link",
        });
        await this.selected.execute();
        this.selected = null;
    }
}