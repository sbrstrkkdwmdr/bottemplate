import * as Discord from 'discord.js';
import { gen } from './commandHelper';
import { Command, InputHandler } from './commands/command';
import * as helper from './helper';
import * as checks from './tools/checks';
import * as commandTools from './tools/commands';

export class ButtonHandler extends InputHandler {
    buttonWarnedUsers = new Set();
    async onMessage(message: Discord.Message) {

    }
    async onInteraction(interaction: Discord.Interaction) {
        if (!(interaction.type == Discord.InteractionType.MessageComponent || interaction.type == Discord.InteractionType.ModalSubmit)) return;
        if (interaction.applicationId != helper.vars.client?.application?.id) return;
        this.overrides = {
            commandAs: 'button',
        };
        
        let canReply = true;
        if (!checks.botHasPerms(interaction, ['ReadMessageHistory'])) {
            canReply = false;
        }
        interaction = interaction as Discord.ButtonInteraction; //| Discord.SelectMenuInteraction

        //version-buttonType-baseCommand-userId-commandId-extraValue
        //buttonVer-button-command-specid-id-???
        const buttonsplit = interaction.customId.split('-');
        const buttonVer = buttonsplit[0];
        const buttonType = buttonsplit[1] as helper.bottypes.buttonType;
        const cmd = buttonsplit[2];
        const specid = buttonsplit[3];

        if (buttonVer != helper.versions.releaseDate) {
            const findcommand = helper.versions.versions.find(x =>
                x.name == buttonVer ||
                x.releaseDate.replaceAll('-', '') == buttonVer
            ) ?? false;
            await interaction.reply({
                content: `You cannot use this command as it is outdated
    Bot version: ${helper.versions.releaseDate} (${helper.versions.current})
    Command version: ${findcommand ? `${findcommand.releaseDate} (${findcommand.name})` : 'INVALID'}
    `,
                flags: Discord.MessageFlags.Ephemeral,
                allowedMentions: { repliedUser: false }
            });
            return;
        }
        if (specid && specid != 'any' && specid != interaction.user.id) {
            if (!this.buttonWarnedUsers.has(interaction.member.user.id)) {
                await interaction.reply({
                    content: 'You cannot use this button',
                    flags: Discord.MessageFlags.Ephemeral,
                    allowedMentions: { repliedUser: false }
                });
                this.buttonWarnedUsers.add(interaction.member.user.id);
                setTimeout(() => {
                    this.buttonWarnedUsers.delete(interaction.member.user.id);
                }, 1000 * 60 * 60 * 24);
            } else {
                interaction.deferUpdate()
                    .catch(error => { });
            }
            return;
        }

        await this.handleButtons(buttonType, interaction, cmd.toLowerCase());

        if (await this.specialCommands(buttonsplit, buttonType, interaction, cmd.toLowerCase())) {
            return;
        }

        try {
            this.commandSelect(cmd.toLowerCase(), interaction);
            this.runCommand(interaction, buttonType, +buttonsplit[4], null, true);
        } catch (err) { }
    }

    async handleButtons(buttonType: helper.bottypes.buttonType, interaction: Discord.ButtonInteraction, cmd: string) {
        const PageOnlyCommands = [
            'Firsts', 'MapLeaderboard', 'NoChokes', 'OsuTop', 'Pinned', 'Ranking', 'Recent', 'RecentList', 'RecentActivity', 'MapScores', 'UserBeatmaps',
            'Changelog',
        ];
        const ScoreSortCommands = [
            'Firsts', 'MapLeaderboard', 'NoChokes', 'OsuTop', 'Pinned', 'RecentList', 'MapScores',

        ];
        if (buttonType == 'Search' && PageOnlyCommands.includes(cmd)) {
            const menu = new Discord.ModalBuilder()
                .setTitle('Page')
                .setCustomId(`${helper.versions.releaseDate}-SearchMenu-${cmd}-${interaction.user.id}-${commandTools.getCmdId()}`)
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
                case 'map': case 'ppcalc':
                    {
                        //interaction is converted to a base interaction first because button interaction and select menu interaction don't overlap
                        this.overrides.id = ((interaction as Discord.BaseInteraction) as Discord.SelectMenuInteraction).values[0];
                        // @ts-expect-error TS2339: Property 'components' does not exist on type 'TopLevelComponent'.
                        if (interaction?.message?.components[2]?.components[0]) {
                            // @ts-expect-error TS2339: Property 'components' does not exist on type 'TopLevelComponent'.
                            overrides.overwriteModal = interaction.message.components[2].components[0] as any;
                        }
                    }
                    break;
                case 'help':
                    {
                        this.overrides.ex = ((interaction as Discord.BaseInteraction) as Discord.SelectMenuInteraction).values[0];
                    }
                    break;
            }
        }

        
    }
    /**
     * for buttons that activate another command
     * eg. a button on a leaderboard panel that calls a show user command
     */
    async specialCommands(buttonsplit: string[], buttonType: helper.bottypes.buttonType, interaction: Discord.ButtonInteraction, cmd: string) {
        return false;
    }

    commandSelect(cmd: string, interaction: Discord.ButtonInteraction) {
        switch (cmd.toLowerCase()) {
            case 'help':
                this.selected = new gen.Help();
                break;
            default:
                this.runFail(interaction);
                throw new Error('No command found');
        }
    }

    async runCommand(interaction: Discord.ButtonInteraction, buttonType: helper.bottypes.buttonType, id: number, overrideType?: "message" | "button" | "interaction" | "link" | "other", defer?: boolean) {
        if (defer) {
            await interaction.deferUpdate()
                .catch(error => { });
        }
        if (this.selected) {
            this.selected.setInput({
                message: overrideType == "other" ? null : interaction.message,
                interaction,
                args: [],
                date: new Date(),
                id,
                overrides: this.overrides,
                canReply: true,
                type: overrideType ?? "button",
                buttonType
            });
            await this.selected.execute();
        } else {
            this.runFail(interaction);
        }
        this.selected = null;
        this.overrides = null;
    }

    runFail(interaction: Discord.ButtonInteraction) {
        try {
            interaction.reply({
                content: 'There was an error trying to run this command',
                flags: Discord.MessageFlags.Ephemeral
            });
        } catch (e) {

        }
    }
}