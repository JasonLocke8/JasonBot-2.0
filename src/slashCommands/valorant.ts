import { SlashCommandBuilder, TextChannel, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../types";
import Mapa from "../schemas/Mapa";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("valorant")
    .addStringOption((option) => {
      return option
        .setName("mapa")
        .setDescription("Nombre del mapa")
        .setRequired(true)
        .setAutocomplete(true);
    })
    .setDescription("Muestra un posible team del mapa seleccionado."),

  autocomplete: async (interaction) => {
    try {
      const focusedValue = interaction.options.getFocused();
      const mapas = await Mapa.find();
      const filtered = mapas.filter((mapa) =>
        mapa.name.toLowerCase().includes(focusedValue.toLowerCase())
      );
      await interaction.respond(
        filtered.map((mapa) => ({ name: mapa.value, value: mapa.name }))
      );
    } catch (error) {
      console.error(error);
    }
  },

  execute: async (interaction) => {
    try {
      const mapaName = interaction.options.getString("mapa");
      const mapa = await Mapa.findOne({ name: mapaName });
      if (!mapa) {
        await interaction.reply({
          content: "Mapa no encontrado.",
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`🗺️  ${mapa.value}`)
        .setDescription("\n```\nAgentes recomendados para este mapa:\n```\n")
        .addFields({ name: "\n", value: "\n", inline: false })
        .addFields({
          name: "Duelista:",
          value: "" + mapa.duelista,
          inline: true,
        })
        .addFields({
          name: "Iniciador:",
          value: "" + mapa.iniciador,
          inline: true,
        })
        .addFields({ name: "\n", value: "\n", inline: false })
        .addFields({
          name: "Controlador:",
          value: "" + mapa.controlador,
          inline: true,
        })
        .addFields({
          name: "Centinela:",
          value: "" + mapa.centinela,
          inline: true,
        })
        .setImage(mapa.image)
        .setColor("#0xff0000")
        .setThumbnail(
          "https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png"
        )
        .setFooter({
          text: "via JasonBot",
          iconURL:
            "https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png",
        });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al ejecutar el comando.",
        ephemeral: true,
      });
    }
  },
};

export default command;