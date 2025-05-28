import {
  SlashCommandBuilder,
  AutocompleteInteraction,
  User,
} from "discord.js";
import { SlashCommand } from "../../types";
import Torneo from "../../schemas/Torneo";
import mongoose from "mongoose";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ingresarpartido")
    .addStringOption((option) =>
      option
        .setName("nombre")
        .setDescription("El nombre del torneo de fútbol (solo torneos activos).")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("integrante1")
        .setDescription("Primer jugador (debe estar registrado en el torneo)")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("integrante2")
        .setDescription("Segundo jugador (debe estar registrado en el torneo)")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("resultado")
        .setDescription("Ingresa el resultado. Usa el formato X-Y (ejemplo: 2-2 o 3-1).")
        .setRequired(true)
    )
    .setDescription("Ingresa el resultado de un partido de fútbol en un torneo específico."),
  execute: async (interaction) => {
    try {
      const torneoNombre = interaction.options.getString("nombre")?.trim();
      const integrante1Nombre = interaction.options.getString("integrante1")?.trim();
      const integrante2Nombre = interaction.options.getString("integrante2")?.trim();
      const resultado = interaction.options.getString("resultado")?.trim();

      // Validar campos requeridos
      if (!torneoNombre || !integrante1Nombre || !integrante2Nombre || !resultado) {
        await interaction.reply({
          content: "Debes completar todos los campos requeridos.",
          ephemeral: true,
        });
        return;
      }

      // Validar formato del resultado
      const resultadoRegex = /^(\d+)-(\d+)$/;
      const resultadoMatch = resultado.match(resultadoRegex);
      if (!resultadoMatch) {
        await interaction.reply({
          content: "El formato del resultado es inválido. Usa el formato X-Y (ejemplo: 2-2 o 3-1).",
          ephemeral: true,
        });
        return;
      }
      const goles1 = parseInt(resultadoMatch[1], 10);
      const goles2 = parseInt(resultadoMatch[2], 10);

      // Verificar si el torneo existe y es de tipo Futbol y está activo
      const torneo = await Torneo.findOne({ nombre: torneoNombre, tipo: "Futbol", activo: true });
      if (!torneo) {
        await interaction.reply({
          content: `No se encontró un torneo de fútbol activo con el nombre "${torneoNombre}".`,
          ephemeral: true,
        });
        return;
      }

      // Buscar la colección del torneo y los jugadores
      const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_");
      const torneoCollection = mongoose.connection.collection(torneoCollectionName);

      const jugador1 = await torneoCollection.findOne({ nombre: integrante1Nombre });
      const jugador2 = await torneoCollection.findOne({ nombre: integrante2Nombre });

      if (!jugador1 || !jugador2) {
        await interaction.reply({
          content: "Ambos jugadores deben estar registrados en el torneo.",
          ephemeral: true,
        });
        return;
      }

      // Insertar el registro del partido
      const registro = {
        integrante1: {
          nombre: jugador1.nombre,
        },
        integrante2: {
          nombre: jugador2.nombre,
        },
        goles1,
        goles2,
        resultado: `${goles1}-${goles2}`,
        fecha: new Date(),
      };

      await torneoCollection.insertOne(registro);

      // Actualizar estadísticas de los jugadores
      // Jugador 1
      let updateJugador1: any = {
        $inc: {
          pj: 1,
          gf: goles1,
          gc: goles2,
        },
      };
      // Jugador 2
      let updateJugador2: any = {
        $inc: {
          pj: 1,
          gf: goles2,
          gc: goles1,
        },
      };

      if (goles1 > goles2) {
        // Gana jugador 1
        updateJugador1.$inc.pg = 1;
        updateJugador1.$inc.pts = 3;
        updateJugador2.$inc.pp = 1;
      } else if (goles1 < goles2) {
        // Gana jugador 2
        updateJugador2.$inc.pg = 1;
        updateJugador2.$inc.pts = 3;
        updateJugador1.$inc.pp = 1;
      } else {
        // Empate
        updateJugador1.$inc.pe = 1;
        updateJugador1.$inc.pts = 1;
        updateJugador2.$inc.pe = 1;
        updateJugador2.$inc.pts = 1;
      }

      // Actualizar diferencia de goles
      updateJugador1.$inc.dg = goles1 - goles2;
      updateJugador2.$inc.dg = goles2 - goles1;

      await torneoCollection.updateOne(
        { nombre: jugador1.nombre },
        updateJugador1
      );
      await torneoCollection.updateOne(
        { nombre: jugador2.nombre },
        updateJugador2
      );

      await interaction.reply({
        content: `El partido entre **${jugador1.nombre}** y **${jugador2.nombre}** (${goles1}-${goles2}) ha sido registrado correctamente en el torneo "${torneoNombre}".`,
        ephemeral: false,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al intentar registrar el partido. Por favor, inténtalo de nuevo más tarde.",
        ephemeral: true,
      });
    }
  },

  autocomplete: async (interaction: AutocompleteInteraction) => {
    try {
      const focusedOption = interaction.options.getFocused(true);
      const torneoNombre = interaction.options.getString("nombre")?.trim();

      // Autocompletar nombre del torneo
      if (focusedOption.name === "nombre") {
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

      // Autocompletar jugadores solo si ya se eligió el torneo
      if (
        (focusedOption.name === "integrante1" || focusedOption.name === "integrante2") &&
        torneoNombre
      ) {
        const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_");
        const torneoCollection = mongoose.connection.collection(torneoCollectionName);
        const jugadores = await torneoCollection
          .find({ pj: { $gte: 0 } }) // Solo documentos que sean jugadores
          .toArray();
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