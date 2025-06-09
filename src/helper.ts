import { Client } from 'discord.js';
// bundle all functions in one file
import * as path from './path.js';
import * as calculate from './tools/calculate.js';
import * as checks from './tools/checks.js';
import * as colourcalc from './tools/colourcalc.js';
import * as commandTools from './tools/commands.js';
import * as formatter from './tools/formatters.js';
import * as log from './tools/log.js';
import * as other from './tools/other.js';

import * as argflags from './vars/argFlags.js';
import * as buttons from './vars/buttons.js';
import * as colours from './vars/colours.js';
import * as commandData from './vars/commandData.js';
import * as defaults from './vars/defaults.js';
import * as emojis from './vars/emojis.js';
import * as errors from './vars/errors.js';
import * as versions from './vars/versions.js';

import * as admin from './commands/admin.js';
import * as gen from './commands/general.js';
import * as fun from './commands/misc.js';

import * as bottypes from './types/bot.js';

export const tools = {
    calculate,
    checks,
    colourcalc,
    commands: commandTools,
    formatter,
    log,
    other,
    performance,
};
export const vars = {
    client: null as Client, // initialised in main.ts
    path,
    config: checks.checkConfig(),
    cooldownSet: (new Set()) as Set<string>,
    startTime: new Date(),
    id: 0,
    argflags,
    buttons,
    colours,
    commandData,
    defaults,
    emojis,
    errors,
    reminders: [] as bottypes.reminder[],
    versions,
};
export const commands = {
    gen,
    fun,
    admin,
};