import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

let mapas = ["sunset", "lotus", "pearl", "heaven", "ascent", "icebox", "split", "bind", "fracture", "breeze"]

const ClearCommand : SlashCommand = {
    command: new SlashCommandBuilder()
    .setName("valorant")
    .setDescription("Muestra un posible team del mapa seleccionado.")
    
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: interaction => {
        let messageCount = Number(interaction.options.get("messagecount")?.value)
        interaction.channel?.messages.fetch({limit: messageCount})
        .then(async msgs => {
            if(interaction.channel?.type === ChannelType.DM) return;
            const deletedMessages = await interaction.channel?.bulkDelete(msgs,true)   
            if (deletedMessages?.size === 0) interaction.reply("No messages were deleted.")       
            else interaction.reply(`Successfully deleted ${deletedMessages?.size} message(s)`)
            setTimeout(() => interaction.deleteReply(), 5000)
        })
    },
    cooldown: 10
}

export default ClearCommand;