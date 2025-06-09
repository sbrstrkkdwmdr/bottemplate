import * as Discord from 'discord.js';
import { Command } from './commands/command.js';
import * as helper from './helper.js';
import * as bottypes from './types/bot.js';
// message = interaction.message
const buttonWarnedUsers = new Set();
let command: Command;
let foundCommand = true;
let overrides: bottypes.overrides = {
    commandAs: 'button',
};
let mainId: number;
export async function onInteraction(interaction: Discord.Interaction) {
    if (!(interaction.type == Discord.InteractionType.MessageComponent || interaction.type == Discord.InteractionType.ModalSubmit)) return;
    if (interaction.applicationId != helper.vars.client.application.id) return;
    overrides = {
        commandAs: 'button',
    };
    let canReply = true;
    if (!helper.tools.checks.botHasPerms(interaction, ['ReadMessageHistory'])) {
        canReply = false;
    }
    interaction = interaction as Discord.ButtonInteraction; //| Discord.SelectMenuInteraction

    //version-buttonType-baseCommand-userId-commandId-extraValue
    //buttonVer-button-command-specid-id-???
    const buttonsplit = interaction.customId.split('-');
    const buttonVer = buttonsplit[0];
    const buttonType = buttonsplit[1] as bottypes.buttonType;
    const cmd = buttonsplit[2];
    const specid = buttonsplit[3];
    mainId = +buttonsplit[4];

    if (buttonVer != helper.vars.versions.releaseDate) {
        const findcommand = helper.vars.versions.versions.find(x =>
            x.name == buttonVer ||
            x.releaseDate.replaceAll('-', '') == buttonVer
        ) ?? false;
        await interaction.reply({
            content: `You cannot use this command as it is outdated
Bot version: ${helper.vars.versions.releaseDate} (${helper.vars.versions.current})
Command version: ${findcommand ? `${findcommand.releaseDate} (${findcommand.name})` : 'INVALID'}
`,
            flags: Discord.MessageFlags.Ephemeral,
            allowedMentions: { repliedUser: false }
        });
        return;
    }
    const commandType = 'button';
    if (specid && specid != 'any' && specid != interaction.user.id) {
        if (!buttonWarnedUsers.has(interaction.member.user.id)) {
            await interaction.reply({
                content: 'You cannot use this button',
                flags: Discord.MessageFlags.Ephemeral,
                allowedMentions: { repliedUser: false }
            });
            buttonWarnedUsers.add(interaction.member.user.id);
            setTimeout(() => {
                buttonWarnedUsers.delete(interaction.member.user.id);
            }, 1000 * 60 * 60 * 24);
        } else {
            interaction.deferUpdate()
                .catch(error => { });
        }
        return;
    }
    const errorEmbed = new Discord.EmbedBuilder()
        .setTitle('Error - Button does not work')
        .setDescription('Feature not yet implemented/supported');

    const PageOnlyCommands = [
        'firsts', 'maplb', 'nochokes', 'osutop', 'pinned', 'ranking', 'recent', 'recentactivity', 'scores', 'userbeatmaps',
        'changelog',
        'ytsearch',
    ];
    const ScoreSortCommands = ['firsts', 'maplb', 'nochokes', 'osutop', 'pinned', 'scores'];
    if (buttonType == 'Search' && PageOnlyCommands.includes(cmd)) {
        const menu = new Discord.ModalBuilder()
            .setTitle('Page')
            .setCustomId(`${helper.vars.versions.releaseDate}-SearchMenu-${cmd}-${interaction.user.id}-${mainId}`)
            .addComponents(
                //@ts-expect-error - TextInputBuilder not assignable to AnyInputBuilder
                new Discord.ActionRowBuilder()
                    .addComponents(new Discord.TextInputBuilder()
                        .setCustomId('SearchInput')
                        .setLabel("What page do you want to go to?")
                        .setStyle(Discord.TextInputStyle.Short)
                    )
            );


        interaction.showModal(menu)
            .catch(error => { });
        return;
    }
    if (buttonType.includes('Select')) {
        switch (cmd) {
            case 'help':
                {
                    overrides.ex = ((interaction as Discord.BaseInteraction) as Discord.SelectMenuInteraction).values[0];
                }
                break;
        }
    }

    const nopingcommands = ['scorestats'];

    switch (cmd) {
        case 'Help':
            command = new helper.commands.gen.Help();
            foundCommand = true;
            break;
        default:
            runFail(interaction);
            return;
    }
    runCommand(interaction, buttonType, null, true);
}

async function runCommand(interaction: Discord.ButtonInteraction, buttonType: bottypes.buttonType, overrideType?: "message" | "button" | "interaction" | "link" | "other", defer?: boolean) {
    if (defer) {
        await interaction.deferUpdate()
            .catch(error => { });
    }
    if (foundCommand && command) {
        command.setInput({
            message: overrideType == "other" ? null : interaction.message,
            interaction,
            args: [],
            date: new Date(),
            id: mainId,
            overrides,
            canReply: true,
            type: overrideType ?? "button",
            buttonType
        });
        await command.execute();
    } else {
        runFail(interaction);
    }
}

function runFail(interaction: Discord.ButtonInteraction) {
    try {
        interaction.reply({
            content: 'There was an error trying to run this command',
            flags: Discord.MessageFlags.Ephemeral
        });
    } catch (e) {

    }
}