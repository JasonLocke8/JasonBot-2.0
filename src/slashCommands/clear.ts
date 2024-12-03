import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const ClearCommand : SlashCommand = {
    command: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Borra mensajes del chat.")
    .addIntegerOption(option => {
        return option
        .setMaxValue(100)
        .setMinValue(1)
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a borrar")
        .setRequired(true)
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: interaction => {
        let cantidad = Number(interaction.options.get("cantidad")?.value)
        interaction.channel?.messages.fetch({limit: cantidad})
        .then(async msgs => {
            if(interaction.channel?.type === ChannelType.DM) return;
            const deletedMessages = await interaction.channel?.bulkDelete(msgs,true)   
            if (deletedMessages?.size === 0) interaction.reply("No se borraron mensajes.")       
            else interaction.reply(`${deletedMessages?.size} mensaje(s) borrado(s)`)
            setTimeout(() => interaction.deleteReply(), 5000)
        })
    },
    cooldown: 10
}

export default ClearCommand;