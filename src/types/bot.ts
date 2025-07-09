import Discord from 'discord.js';
import * as tooltypes from './tools';
export type commandInfo = {
    name: string,
    description: string,
    category: 'general' | 'misc' | 'admin';
    usage: string, //name <required arg> [optional arg]
    aliases: string[],
    examples?: { text: string, description: string; }[],  // "cmd 1", "does x 1 time"
    args?: commandInfoOption[],
};

export type commandInfoOption = {
    name: string,
    description: string,
    type: string, // string, bool, int, etc.
    format: string[],
    options?: string[],
    required: string | boolean,
    defaultValue: string,
};

/**
 * c = new command(input)
 * c.parseArgs();
 * c.execute();
 * args are meant to be a key-value object
 * eg.
 * 
 */

export type args = {
    name: string,
    value: any,
};


export type commandInput = {
    message?: Discord.Message,
    interaction?: Discord.ChatInputCommandInteraction | Discord.ButtonInteraction,
    args: string[],
    id: number | string,
    date: Date,
    overrides: overrides,
    canReply: boolean,
    type: "message" | "interaction" | "link" | "button" | "other", // "other" is for special cases where arg handling needs to be bypassed eg. scores from scorelist commands
    buttonType?: buttonType;
};

export type overrides = tooltypes.Dict & {
    ex?: string | number;
    commandAs?: "message" | "interaction" | "link" | "button",
};

export type buttonType = 'BigLeftArrow' | 'LeftArrow' | 'Search' | 'RightArrow' | 'BigRightArrow' |
    'Refresh' | 'Select' | 'Random' |
    'DetailEnable' | 'DetailDisable' | 'Detailed' | 'Details' |
    'DetailDefault' | 'DetailMore' | 'DetailLess' |
    'Detail0' | 'Detail1' | 'Detail2' | 'Detail3' |
    'DetailN1';

export type config = {
    token: string,
    prefix: string,
    owners: string[],
    logs: {
        console: boolean,
        file: boolean,
    };
};

export type command = (input: commandInput) => Promise<void>;

export type reminder = {
    time: number,
    text: string,
    userID: string,
};