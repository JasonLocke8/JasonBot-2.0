import {
  SlashCommandBuilder,
  AutocompleteInteraction,
} from "discord.js";
import { SlashCommand } from "../../types";
import Torneo from "../../schemas/Torneo";
import mongoose from "mongoose";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("eliminarjugador")
    .addStringOption((option) =>
      option
        .setName("torneo")
        .setDescription("El nombre del torneo de fútbol (solo torneos activos).")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("jugador")
        .setDescription("Nombre del jugador a eliminar.")
        .setRequired(true)
    )
    .setDescription("Elimina un jugador de un torneo de fútbol."),
  execute: async (interaction) => {
    try {
      const torneoNombre = interaction.options.getString("torneo")?.trim();
      const jugadorNombre = interaction.options.getString("jugador")?.trim();

      // Validar campos requeridos
      if (!torneoNombre || !jugadorNombre) {
        await interaction.reply({
          content: "Debes completar todos los campos requeridos.",
          ephemeral: true,
        });
        return;
      }

      // Verificar si el torneo existe y es de tipo Futbol y está activo
      const torneo = await Torneo.findOne({ nombre: torneoNombre, tipo: "Futbol", activo: true });
      if (!torneo) {
        await interaction.reply({
          content: `No se encontró un torneo de fútbol activo con el nombre "${torneoNombre}".`,
          ephemeral: true,
        });
        return;
      }

      // Buscar la colección del torneo
      const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_");
      const torneoCollection = mongoose.connection.collection(torneoCollectionName);

      // Verificar si el jugador existe
      const jugadorExistente = await torneoCollection.findOne({ nombre: jugadorNombre });
      if (!jugadorExistente) {
        await interaction.reply({
          content: `El jugador "${jugadorNombre}" no está registrado en el torneo "${torneoNombre}".`,
          ephemeral: true,
        });
        return;
      }

      // Eliminar el jugador
      await torneoCollection.deleteOne({ nombre: jugadorNombre });

      await interaction.reply({
        content: `El jugador **${jugadorNombre}** ha sido eliminado del torneo "${torneoNombre}".`,
        ephemeral: false,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al intentar eliminar el jugador.",
        ephemeral: true,
      });
    }
  },

  autocomplete: async (interaction: AutocompleteInteraction) => {
    try {
      const focusedOption = interaction.options.getFocused(true);
      const torneoNombre = interaction.options.getString("torneo")?.trim();

      // Autocompletar nombre del torneo
      if (focusedOption.name === "torneo") {
        const torneos = await Torneo.find({ tipo: "Futbol", activo: true });
        const choices = torneos.map((torneo) => torneo.nombre);
        const filtered = choices.filter((choice) =>
          choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        );
        await interaction.respond(
          filtered.map((choice) => ({ name: choice, value: choice }))
        );
        return;
      }

      // Autocompletar jugadores del torneo seleccionado
      if (focusedOption.name === "jugador" && torneoNombre) {
        const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_");
        const torneoCollection = mongoose.connection.collection(torneoCollectionName);
        const jugadores = await torneoCollection.find({ pj: { $gte: 0 } }).toArray();
        const choices = jugadores.map((jug) => jug.nombre);
        const filtered = choices.filter((choice) =>
          choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        );
        await interaction.respond(
          filtered.map((choice) => ({ name: choice, value: choice }))
        );
        return;
      }

      // Default: no sugerencias
      await interaction.respond([]);
    } catch (error) {
      console.error("Error en el autocompletado:", error);
    }
  },

  cooldown: 10,
};

export default command;