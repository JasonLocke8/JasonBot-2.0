import {
  SlashCommandBuilder,
  TextChannel,
  AutocompleteInteraction,
} from "discord.js";
import { SlashCommand } from "../types";
import Torneo from "../schemas/Torneo";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("eliminartorneo")
    .addStringOption((option) =>
      option
        .setName("nombre")
        .setDescription("El nombre del torneo a eliminar.")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDescription("Elimina un torneo y todos los roles asociados."),
  execute: async (interaction) => {
    try {
      const torneoNombre = interaction.options.getString("nombre");
      if (!torneoNombre) {
        await interaction.reply({
          content: "Debes proporcionar el nombre del torneo.",
          ephemeral: true,
        });
        return;
      }

      const torneo = await Torneo.findOne({ nombre: torneoNombre });
      if (!torneo) {
        await interaction.reply({
          content: `No se encontró un torneo con el nombre "${torneoNombre}".`,
          ephemeral: true,
        });
        return;
      }

      const guild = interaction.guild;
      if (!guild) {
        await interaction.reply({
          content: "Este comando solo puede usarse en un servidor.",
          ephemeral: true,
        });
        return;
      }

      // Eliminar roles asociados
      const rolesToDelete = guild.roles.cache.filter((role) =>
        role.name.startsWith(`${torneoNombre}: Equipo`)
      );
      for (const role of rolesToDelete.values()) {
        await role.delete(
          `Eliminando roles asociados con el torneo "${torneoNombre}"`
        );
      }

      // Eliminar el mensaje original
      const channel = guild.channels.cache.get(torneo.canalId) as TextChannel;
      if (channel) {
        const message = await channel.messages.fetch(torneo.mensajeId);
        if (message) {
          await message.delete();
        }
      }

      // Eliminar el torneo de la base de datos
      await torneo.deleteOne();

      await interaction.reply({
        content: `El torneo "${torneoNombre}" y todos los roles asociados han sido eliminados.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al intentar eliminar el torneo.",
        ephemeral: true,
      });
    }
  },

  autocomplete: async (interaction: AutocompleteInteraction) => {
    try {
      const focusedValue = interaction.options.getFocused();
      const torneos = await Torneo.find();
      const choices = torneos.map((torneo) => torneo.nombre);
      const filtered = choices.filter((choice) =>
        choice.toLowerCase().startsWith(focusedValue.toLowerCase())
      );
      await interaction.respond(
        filtered.map((choice) => ({ name: choice, value: choice }))
      );
    } catch (error) {
      console.error("Error en el autocompletado:", error);
    }
  },

  cooldown: 10,
};

export default command;