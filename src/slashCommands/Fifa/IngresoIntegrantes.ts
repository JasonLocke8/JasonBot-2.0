import {
  SlashCommandBuilder,
  AutocompleteInteraction,
} from "discord.js";
import { SlashCommand } from "../../types";
import Torneo from "../../schemas/Torneo";
import mongoose from "mongoose";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ingresarjugador")
    .addStringOption((option) =>
      option
        .setName("nombre")
        .setDescription("El nombre del torneo de fútbol (solo torneos activos).")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("jugador")
        .setDescription("Nombre del jugador a registrar.")
        .setRequired(true)
    )
    .setDescription("Registra un jugador en un torneo de fútbol."),
  execute: async (interaction) => {
    try {
      const torneoNombre = interaction.options.getString("nombre")?.trim();
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

      // Verificar si el jugador ya existe
      const jugadorExistente = await torneoCollection.findOne({ nombre: jugadorNombre });
      if (jugadorExistente) {
        await interaction.reply({
          content: `El jugador "${jugadorNombre}" ya está registrado en el torneo "${torneoNombre}".`,
          ephemeral: true,
        });
        return;
      }

      // Crear el registro del jugador con estadísticas iniciales
      const jugador = {
        nombre: jugadorNombre,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        pts: 0,
      };

      await torneoCollection.insertOne(jugador);

      await interaction.reply({
        content: `El jugador **${jugadorNombre}** ha sido registrado en el torneo "${torneoNombre}".`,
        ephemeral: false,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al intentar registrar el jugador.",
        ephemeral: true,
      });
    }
  },

  autocomplete: async (interaction: AutocompleteInteraction) => {
    try {
      const focusedValue = interaction.options.getFocused();
      // Solo torneos de tipo Futbol y activos
      const torneos = await Torneo.find({ tipo: "Futbol", activo: true });
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