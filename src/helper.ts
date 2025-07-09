import { Client } from 'discord.js';
// bundle all functions in one file
import * as path from './path';
import * as checks from './tools/checks';

export * as bottypes from './types/bot';
export * as tooltypes from './types/tools';
export * as argflags from './vars/argFlags';
export * as buttons from './vars/buttons';
export * as colours from './vars/colours';
export * as commandData from './vars/commandData';
export * as defaults from './vars/defaults';
export * as emojis from './vars/emojis';
export * as errors from './vars/errors';
export * as versions from './vars/versions';

import * as bottypes from './types/bot';

export const vars = {
    client: null as Client, // initialised in main.ts
    path,
    config: checks.checkConfig(),
    cooldownSet: (new Set()) as Set<string>,
    startTime: new Date(),
    id: 0,
    reminders: [] as bottypes.reminder[],
};