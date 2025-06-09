import * as Discord from 'discord.js';
import { Command } from './commands/command.js';
import * as helper from './helper.js';
import * as bottypes from './types/bot.js';

let command: Command;
const overrides: bottypes.overrides = {

};
let id: number;
export async function onMessage(message: Discord.Message) {
    if (!(message.content.startsWith('http') || message.content.includes('osu.') || message.attachments.size > 0)) {
        return;
    }
    let canReply = true;
    if (!helper.tools.checks.botHasPerms(message, ['ReadMessageHistory'])) {
        canReply = false;
    }


    const messagenohttp = message.content.replace('https://', '').replace('http://', '').replace('www.', '');
    if (messagenohttp.startsWith('testtesttest')) {
        id = helper.tools.commands.getCmdId();
        command = new helper.commands.gen.Info();
        await runCommand(message);
        return;
    }
}

async function runCommand(message: Discord.Message,) {
    command.setInput({
        message,
        interaction: null,
        args: [],
        date: new Date(),
        id,
        overrides,
        canReply: true,
        type: "link",
    });
    await command.execute();
}