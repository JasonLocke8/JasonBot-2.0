import {
    SlashCommandBuilder,
    AutocompleteInteraction,
  } from "discord.js";
  import { SlashCommand } from "../../types";
  import Torneo from "../../schemas/Torneo";
  import mongoose from "mongoose";
  
  const command: SlashCommand = {
    command: new SlashCommandBuilder()
      .setName("ingresar")
      .addStringOption((option) =>
        option
          .setName("nombre")
          .setDescription("El nombre del torneo el cual quieres ingresar tu KDA.")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("kda")
          .setDescription("Tu KDA en formato K/D/A (ejemplo: 10/2/5).")
          .setRequired(true)
      )
      .setDescription("Ingresa tu KDA en un torneo específico."),
    execute: async (interaction) => {
      try {
        const torneoNombre = interaction.options.getString("nombre")?.trim();
        const kda = interaction.options.getString("kda")?.trim();
        const usuario = interaction.user;
  
        // Validar que el nombre del torneo no sea undefined o vacío
        if (!torneoNombre) {
          await interaction.reply({
            content: "Debes proporcionar un nombre válido para el torneo.",
            ephemeral: true,
          });
          return;
        }
  
        // Validar formato del KDA
        const kdaRegex = /^(\d+)\/(\d+)\/(\d+)$/;
        const kdaMatch = kda?.match(kdaRegex);
        if (!kdaMatch) {
          await interaction.reply({
            content: "El formato del KDA es inválido. Usa el formato K/D/A (ejemplo: 10/2/5).",
            ephemeral: true,
          });
          return;
        }
  
        // Verificar si el torneo existe
        const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_");
        const torneoCollection = mongoose.connection.collection(torneoCollectionName);
  
        const torneoExists = await torneoCollection.stats().catch(() => null);
        if (!torneoExists) {
          await interaction.reply({
            content: `No se encontró un torneo con el nombre "${torneoNombre}".`,
            ephemeral: true,
          });
          return;
        }
  
        // Insertar el registro en la colección del torneo
        const registro = {
          usuarioId: usuario.id,
          usuarioTag: usuario.tag,
          kda,
          fecha: new Date(),
        };
  
        await torneoCollection.insertOne(registro);
  
        await interaction.reply({
          content: `El KDA (${kda}) ha sido registrado correctamente en el torneo "${torneoNombre}".`,
          ephemeral: false,
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "Ocurrió un error al intentar registrar tu KDA. Por favor, inténtalo de nuevo más tarde.",
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