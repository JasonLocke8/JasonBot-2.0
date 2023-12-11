import { Interaction } from "discord.js";
import { BotEvent } from "../types";

const event : BotEvent = {
    name: "interactionCreate",
    execute: (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            let command = interaction.client.slashCommands.get(interaction.commandName)
            let cooldown = interaction.client.cooldowns.get(`${interaction.commandName}-${interaction.user.username}`)
            if (!command) return;
            if (command.cooldown && cooldown) {
                if (Date.now() < cooldown) {
                    interaction.reply(`Tenes que esperar ${Math.floor(Math.abs(Date.now() - cooldown) / 1000)} segundo(s) para usar este comando de vuelta.`)
                    setTimeout(() => interaction.deleteReply(), 5000)
                    return
                }
                interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000)
                setTimeout(() => {
                    interaction.client.cooldowns.delete(`${interaction.commandName}-${interaction.user.username}`)
                }, command.cooldown * 1000)
            } else if (command.cooldown && !cooldown) {
                interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000)
            }
            command.execute(interaction)
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);
            if (!command) {
                console.error(`El comando ${interaction.commandName} no se encontró.`);
                return;
            }
            try {
                if(!command.autocomplete) return;
                command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isModalSubmit()) {
            const command = interaction.client.slashCommands.get(interaction.customId);
            if (!command) {
                console.error(`El comando ${interaction.customId} no se encontró.`);
                return;
            }
            try {
                if(!command.modal) return;
                command.modal(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    }
}

export default event;