import {
  SlashCommandBuilder,
  TextChannel,
  AutocompleteInteraction,
} from "discord.js";
import mongoose from "mongoose"; // Importar mongoose para manejar la conexión
import { SlashCommand } from "../../types";
import Torneo from "../../schemas/Torneo";

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
      // Defer the reply to avoid timeout issues
      await interaction.deferReply({ ephemeral: true });

      const torneoNombre = interaction.options.getString("nombre");
      if (!torneoNombre) {
        await interaction.editReply({
          content: "Debes proporcionar el nombre del torneo.",
        });
        return;
      }

      const torneo = await Torneo.findOne({ nombre: torneoNombre });
      if (!torneo) {
        await interaction.editReply({
          content: `No se encontró un torneo con el nombre "${torneoNombre}".`,
        });
        return;
      }

      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply({
          content: "Este comando solo puede usarse en un servidor.",
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

      // Eliminar la categoría y sus canales
      const categoryName = `Torneo: ${torneoNombre}`;
      const category = guild.channels.cache.find(
        (ch) => ch.name === categoryName && ch.type === 4 // Tipo 4: Categoría
      );
      if (category) {
        // Eliminar todos los canales dentro de la categoría
        const channelsInCategory = guild.channels.cache.filter(
          (ch) => ch.parentId === category.id
        );
        for (const channel of channelsInCategory.values()) {
          await channel.delete(
            `Eliminando canal asociado con la categoría "${categoryName}"`
          );
        }

        // Eliminar la categoría
        await category.delete(
          `Eliminando la categoría asociada con el torneo "${torneoNombre}"`
        );
      }

      // Eliminar el torneo de la base de datos
      await torneo.deleteOne();

      // Eliminar la colección del torneo en MongoDB
      const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_"); // Normalizar el nombre
      const torneoCollection = mongoose.connection.collection(torneoCollectionName);
      await torneoCollection.drop().catch((error) => {
        console.error(`Error al eliminar la colección del torneo "${torneoNombre}":`, error);
      });

      await interaction.editReply({
        content: `🏆 El torneo "${torneoNombre}", su categoría, todos los canales, roles asociados y su colección en la base de datos han sido eliminados.`,
      });
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.editReply({
          content: "Ocurrió un error al intentar eliminar el torneo.",
        });
      }
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