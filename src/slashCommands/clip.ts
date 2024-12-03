import {
    SlashCommandBuilder,
    TextChannel,
    EmbedBuilder,
} from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";
import { MessageCollector } from "discord.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("clip")
        .setDescription("Reacciona con emojis tu clip."),
    execute: (interaction) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
            ],
        });
    },
    cooldown: 10,
};

command.execute = async (interaction) => {
    await interaction.reply({
        content: "```Por favor, envía tu clip:```",
        ephemeral: true
    });

    const filter = (m: any) => m.author.id === interaction.user.id && m.attachments.size > 0;
    if (!interaction.channel) {
        interaction.followUp("No se pudo acceder al canal.");
        return;
    }
    const collector = new MessageCollector(interaction.channel, { filter, max: 1, time: 60000 });

    collector.on("collect", (message) => {
        const clip = message.attachments.first();
        if (clip) {
            const embed = new EmbedBuilder()
                .setTitle("¡Mira este clip!")
                .setDescription("Vota del 1 al 5 que tanto te gustó.")
                .setColor("Green")
                .addFields({ name: "Autor: ", value: `<@${interaction.user.id}>`, inline: true });

            message.channel.send({ 
                embeds: [embed],
                files: [clip.url] 
            }).then(sentMessage => {
                const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
                emojis.forEach(emoji => sentMessage.react(emoji));
                message.delete();
                
            });
        }
    });

    collector.on("end", (collected) => {
        if (collected.size === 0) {
            interaction.followUp("No se recibió ningún clip.");
        }
    });
};

export default command;


