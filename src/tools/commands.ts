import * as Discord from 'discord.js';
import fs from 'fs';
import * as helper from '../helper.js';
import * as bottypes from '../types/bot.js';

export async function sendMessage(input: {
    type: 'message' | 'interaction' | 'link' | 'button' | "other",
    message: Discord.Message<any>,
    interaction: Discord.ChatInputCommandInteraction<any> | Discord.ButtonInteraction<any>;
    args: {
        content?: string,
        embeds?: (Discord.EmbedBuilder | Discord.Embed)[],
        files?: (string | Discord.AttachmentBuilder | Discord.Attachment)[],
        components?: Discord.ActionRowBuilder<any>[],
        ephemeral?: boolean,
        react?: boolean,
        edit?: boolean,
        editAsMsg?: boolean,
    };
},
    canReply: boolean
) {
    if (input.args.files) {
        input.args.files = checkFileLimit(input.args.files);
    }

    try {
        switch (input.type) {
            case 'message': case 'link': {
                if (!canReply) {
                    (input.message.channel as Discord.GuildTextBasedChannel).send({
                        content: `${input.args.content ?? ''}`,
                        embeds: input.args.embeds ?? [],
                        files: input.args.files ?? [],
                        components: input.args.components ?? [],
                    })
                        .catch(x => console.log(x));
                } else if (input.args.editAsMsg) {
                    try {
                        input.message.edit({
                            content: `${input.args.content ?? ''}`,
                            embeds: input.args.embeds ?? [],
                            files: input.args.files ?? [],
                            components: input.args.components ?? [],
                        });
                    } catch (err) {

                    }
                } else {
                    input.message.reply({
                        content: `${input.args.content ?? ''}`,
                        embeds: input.args.embeds ?? [],
                        files: input.args.files ?? [],
                        components: input.args.components ?? [],
                        allowedMentions: { repliedUser: false },
                        failIfNotExists: true
                    })
                        .catch(err => {
                            sendMessage(input, false);
                        });
                }
            }
                break;
            case 'interaction': {
                if (input.args.edit == true) {
                    setTimeout(() => {
                        (input.interaction as Discord.ChatInputCommandInteraction<any>).editReply({
                            content: `${input.args.content ?? ''}`,
                            embeds: input.args.embeds ?? [],
                            files: input.args.files ?? [],
                            components: input.args.components ?? [],
                            allowedMentions: { repliedUser: false },
                        })
                            .catch();
                    }, 1000);
                } else {
                    if (input.interaction.replied) {
                        input.args.edit = true;
                        sendMessage(input, canReply);
                    } else {
                        (input.interaction as Discord.ChatInputCommandInteraction<any>).reply({
                            content: `${input.args.content ?? ''}`,
                            embeds: input.args.embeds ?? [],
                            files: input.args.files ?? [],
                            components: input.args.components ?? [],
                            allowedMentions: { repliedUser: false },
                            // ephemeral: input.args.ephemeral ?? false,
                            flags: input.args.ephemeral ? Discord.MessageFlags.Ephemeral : null,
                        })
                            .catch();
                    }
                }
            }
            case 'button': {
                input.message.edit({
                    content: `${input.args.content ?? ''}`,
                    embeds: input.args.embeds ?? [],
                    files: input.args.files ?? [],
                    components: input.args.components ?? [],
                    allowedMentions: { repliedUser: false },
                })
                    .catch();
            }
                break;
        }
    } catch (error) {
        return error;
    }
    return true;
}

export function checkFileLimit(files: any[]) {
    if (files.length > 10) {
        return files.slice(0, 9);
    } else {
        return files;
    }
}
export function parseArg(
    args: string[],
    searchString: string,
    type: 'string' | 'number',
    defaultValue: any,
    multipleWords?: boolean,
    asInt?: boolean,
) {
    let returnArg;
    let temp;
    temp = args[args.indexOf(searchString) + 1];
    if (!temp || temp.startsWith('-')) {
        returnArg = defaultValue;
    } else {
        switch (type) {
            case 'string': {
                returnArg = temp;
                if (multipleWords == true && temp.includes('"')) {
                    temp = args.join(' ').split(searchString)[1].split('"')[1];
                    for (let i = 0; i < args.length; i++) {
                        if (temp.includes(args[i].replaceAll('"', '')) && i > args.indexOf(searchString)) {
                            args.splice(i, 1);
                            i--;
                        }
                    }
                    returnArg = temp;
                } else {
                    args.splice(args.indexOf(searchString), 2);
                }
            }
                break;
            case 'number': {
                returnArg = +temp;
                if (isNaN(+temp)) {
                    returnArg = defaultValue;
                } else if (asInt == true) {
                    returnArg = parseInt(temp);
                }
                args.splice(args.indexOf(searchString), 2);
            }
                break;
        }
    }
    return {
        value: returnArg,
        newArgs: args
    };
}

/**
 * @param noLinks ignore "button" and "link" command types
 * logs error, sends error to command user then promptly aborts the command
 */
export async function errorAndAbort(input: bottypes.commandInput, commandName: string, interactionEdit: boolean, err: string, noLinks: boolean) {
    if (!err) {
        err = 'undefined error';
    }
    await sendMessage({
        type: 'message',
        message: input.message,
        interaction: input.interaction,
        args: {
            content: err,
            edit: interactionEdit
        }
    }, input.canReply);
    return;
}

export function matchArgMultiple(argFlags: string[], inargs: string[], match: boolean, matchType: 'string' | 'number', isMultiple: boolean, isInt: boolean) {
    let found = false;
    let args: string[] = inargs;
    let matchedValue = null;
    let output = null;
    if (inargs.some(x => {
        if (argFlags.includes(x)) {
            matchedValue = x;
            return true;
        }
        return false;
    })) {
        found = true;
        if (match) {
            const temp = parseArg(inargs, matchedValue, matchType ?? 'number', null, isMultiple, isInt);
            output = temp.value;
            args = temp.newArgs;
        } else {
            output = true;
            inargs.splice(inargs.indexOf(matchedValue), 1);
            args = inargs;
        }
    }
    return {
        found, args, output,
    };
}

export type params = {
    page: number
};

export function getButtonArgs(commandId: string | number) {
    if (fs.existsSync(`${helper.vars.path.main}/cache/params/${commandId}.json`)) {
        const x = fs.readFileSync(`${helper.vars.path.main}/cache/params/${commandId}.json`, 'utf-8');
        return JSON.parse(x) as params;
    }
    return {
        error: true
    };
}

export function storeButtonArgs(commandId: string | number, params: params) {
    if (params?.page < 1) {
        params.page = 1;
    }
    fs.writeFileSync(`${helper.vars.path.main}/cache/params/${commandId}.json`, JSON.stringify(params, null, 2));
}

/**
 * get new page from button
 */
export function buttonPage(page: number, max: number, button: bottypes.buttonType) {
    switch (button) {
        case 'BigLeftArrow':
            page = 1;
            break;
        case 'LeftArrow':
            page--;
            break;
        case 'RightArrow':
            page++;
            break;
        case 'BigRightArrow':
            page = max;
            break;
    }
    return page;
}

/**
 * get detailed level from button
 */
export function buttonDetail(level: number, button: bottypes.buttonType) {
    switch (button) {
        case 'Detail0':
            level = 0;
            break;
        case 'Detail1': case 'DetailDisable':
            level = 1;
            break;
        case 'Detail2': case 'DetailEnable':
            level = 2;
            break;
    }
    return level;
}

/**
 * generate page buttons for current command
 */
export async function pageButtons(commandName: string, commanduser: Discord.User | Discord.APIUser, commandId: string | number) {
    const pgbuttons: Discord.ActionRowBuilder = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(`${helper.vars.versions.releaseDate}-BigLeftArrow-${commandName}-${commanduser.id}-${commandId}`)
                .setStyle(helper.vars.buttons.type.current)
                .setEmoji(helper.vars.buttons.label.page.first).setDisabled(false),
            new Discord.ButtonBuilder()
                .setCustomId(`${helper.vars.versions.releaseDate}-LeftArrow-${commandName}-${commanduser.id}-${commandId}`)
                .setStyle(helper.vars.buttons.type.current)
                .setEmoji(helper.vars.buttons.label.page.previous),
            new Discord.ButtonBuilder()
                .setCustomId(`${helper.vars.versions.releaseDate}-Search-${commandName}-${commanduser.id}-${commandId}`)
                .setStyle(helper.vars.buttons.type.current)
                .setEmoji(helper.vars.buttons.label.page.search),
            new Discord.ButtonBuilder()
                .setCustomId(`${helper.vars.versions.releaseDate}-RightArrow-${commandName}-${commanduser.id}-${commandId}`)
                .setStyle(helper.vars.buttons.type.current)
                .setEmoji(helper.vars.buttons.label.page.next),
            new Discord.ButtonBuilder()
                .setCustomId(`${helper.vars.versions.releaseDate}-BigRightArrow-${commandName}-${commanduser.id}-${commandId}`)
                .setStyle(helper.vars.buttons.type.current)
                .setEmoji(helper.vars.buttons.label.page.last),
        );
    return pgbuttons;
}

/**
 * generate detail switching buttons
 */
export async function buttonsAddDetails(command: string, commanduser: Discord.User | Discord.APIUser, commandId: string | number, buttons: Discord.ActionRowBuilder, detailed: number,
    disabled?: {
        compact: boolean,
        compact_rem: boolean,
        detailed: boolean,
        detailed_rem: boolean,
    }
) {
    switch (detailed) {
        case 0: {
            buttons.addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`${helper.vars.versions.releaseDate}-Detail1-${command}-${commanduser.id}-${commandId}`)
                    .setStyle(helper.vars.buttons.type.current)
                    .setEmoji(helper.vars.buttons.label.main.detailMore),
            );
        }
            break;
        case 1: {
            const temp: Discord.RestOrArray<Discord.AnyComponentBuilder> = [];

            const set0 = new Discord.ButtonBuilder()
                .setCustomId(`${helper.vars.versions.releaseDate}-Detail0-${command}-${commanduser.id}-${commandId}`)
                .setStyle(helper.vars.buttons.type.current)
                .setEmoji(helper.vars.buttons.label.main.detailLess);
            const set2 = new Discord.ButtonBuilder()
                .setCustomId(`${helper.vars.versions.releaseDate}-Detail2-${command}-${commanduser.id}-${commandId}`)
                .setStyle(helper.vars.buttons.type.current)
                .setEmoji(helper.vars.buttons.label.main.detailMore);

            if (disabled) {
                if (disabled.compact == false) {
                    disabled.compact_rem ?
                        null :
                        temp.push(set0.setDisabled(true));
                } else {
                    temp.push(set0);
                }
                if (disabled.detailed == false) {
                    disabled.detailed_rem ?
                        null :
                        temp.push(set2.setDisabled(true));
                } else {
                    temp.push(set2);
                }
            } else {
                temp.push(set0, set2);
            }



            buttons.addComponents(temp);
        }
            break;
        case 2: {
            buttons.addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`${helper.vars.versions.releaseDate}-Detail1-${command}-${commanduser.id}-${commandId}`)
                    .setStyle(helper.vars.buttons.type.current)
                    .setEmoji(helper.vars.buttons.label.main.detailLess),
            );
        }
            break;
    }
    return { buttons };
}

/**
 * 
 * @param args 
 * @returns args with 0 length strings and args starting with the - prefix removed
 */
export function cleanArgs(args: string[]) {
    const newArgs: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] != '' && !args[i].startsWith('-')) {
            newArgs.push(args[i]);
        }
    }
    return newArgs;
}

export function getCmdId() {
    helper.vars.id++;
    return helper.vars.id;
}

/**
 * emit typing event
 */
export function startType(object: Discord.Message | Discord.Interaction) {
    try {
        (object.channel as Discord.GuildTextBasedChannel).sendTyping();
        setTimeout(() => {
            return;
        }, 1000);
    } catch (error) {

    }
}

export function disableAllButtons(msg: Discord.Message) {
    let components: Discord.ActionRowBuilder<any>[] = [];
    for (const actionrow of msg.components) {
        let newActionRow = new Discord.ActionRowBuilder();
        // @ts-expect-error TS2339: Property 'components' does not exist on type 'FileComponent'.
        for (let button of actionrow.components) {
            let newbutton: Discord.ButtonBuilder
                | Discord.StringSelectMenuBuilder
                | Discord.UserSelectMenuBuilder
                | Discord.RoleSelectMenuBuilder
                | Discord.MentionableSelectMenuBuilder
                | Discord.ChannelSelectMenuBuilder;
            switch (button.type) {
                case Discord.ComponentType.Button: {
                    newbutton = Discord.ButtonBuilder.from(button);
                }
                    break;
                case Discord.ComponentType.StringSelect: {
                    newbutton = Discord.StringSelectMenuBuilder.from(button);
                }
                    break;
                case Discord.ComponentType.UserSelect: {
                    newbutton = Discord.UserSelectMenuBuilder.from(button);
                }
                    break;
                case Discord.ComponentType.RoleSelect: {
                    newbutton = Discord.RoleSelectMenuBuilder.from(button);
                }
                    break;
                case Discord.ComponentType.MentionableSelect: {
                    newbutton = Discord.MentionableSelectMenuBuilder.from(button);
                }
                    break;
                case Discord.ComponentType.ChannelSelect: {
                    newbutton = Discord.ChannelSelectMenuBuilder.from(button);
                }
                    break;
            }
            newbutton.setDisabled();
            newActionRow.addComponents(newbutton);
        }

        components.push(newActionRow);
    }
    msg.edit({
        components,
        allowedMentions: { repliedUser: false }
    });
}

export function getCommand(query: string): bottypes.commandInfo {
    return helper.vars.commandData.cmds.find(
        x => x.aliases.concat([x.name]).includes(query)
    );


}

export function getCommands(query?: string): bottypes.commandInfo[] {
    return helper.vars.commandData.cmds.filter(
        x => x.category.includes(query)
    ) ?? helper.vars.commandData.cmds;
}