import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  EmbedBuilder,
  Events,
  MessageReaction,
} from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";
import { trusted } from "mongoose";

let torneoMessageId: string | null = null; // Variable para almacenar el ID del mensaje del torneo

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("creartorneo")
    .addStringOption((option) => {
      return option
        .setName("nombre")
        .setDescription("Nombre del torneo")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("juego")
        .setDescription("Juego del torneo")
        .setRequired(true);
    })
    .addIntegerOption((option) => {
      return option
        .setName("cantidadequipos")
        .setDescription("Cantidad de equipos que participarán (máximo 20)")
        .setRequired(true)
        .setMaxValue(20);
    })
    .setDescription("Crea un torneo con un nombre y una cantidad de equipos."),

  execute: async (interaction) => {
    try {
      const nombre = interaction.options.getString("nombre");
      const cantidadEquipos = interaction.options.getInteger("cantidadequipos");
      const juego = interaction.options.getString("juego");
      const emojis = [
        "🐵",
        "🐶",
        "🐺",
        "🦝",
        "🐱",
        "🦁",
        "🐯",
        "🐴",
        "🦄",
        "🐮",
        "🐷",
        "🐭",
        "🐻",
        "🐨",
        "🐥",
        "🐧",
        "🐸",
        "🐬",
        "🐌",
        "🐝",
      ];

      if (
        cantidadEquipos === null ||
        cantidadEquipos <= 0 ||
        cantidadEquipos > 20
      ) {
        await interaction.reply({
          content: "La cantidad de equipos debe ser mayor a 0 y menor a 20.",
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: `🏆 Torneo "${nombre}" creado con éxito. Participarán ${cantidadEquipos} equipos y se jugará ${juego}.`,
        ephemeral: true,
      });

      const embed = new EmbedBuilder()
        .setTitle("Torneo!")
        .setDescription(
          `El torneo **${nombre}** ha sido creado. Para participar, únete a un equipo reaccionando a un animal.`
        )
        .addFields({
          name: "Juego:",
          value: `${juego}`,
          inline: true,
        })
        .setThumbnail("https://i.imgur.com/Oo4KE52.png")
        .setColor(0x00ff00)
        .setTimestamp();







      const sentMessage = await interaction.channel?.send({ embeds: [embed] });
      if (sentMessage) {
        // Guardar el ID del mensaje para identificarlo más tarde
        torneoMessageId = sentMessage.id; // Guardar el ID del mensaje del torneo

        const embedMessageId = sentMessage.id;

        for (const emoji of emojis.slice(0, cantidadEquipos)) {
          await sentMessage.react(emoji);
        }

        console.log(`Embed del torneo creado con ID: ${embedMessageId}`);










      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al crear el torneo.",
        ephemeral: true,
      });
    }
  },
  cooldown: 10,
};

export default command;
