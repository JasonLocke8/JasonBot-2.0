import {
  SlashCommandBuilder,
  AutocompleteInteraction,
} from "discord.js";
import { SlashCommand } from "../../types";
import Torneo from "../../schemas/Torneo";
import mongoose from "mongoose";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("eliminarpartido")
    .addStringOption((option) =>
      option
        .setName("torneo")
        .setDescription("El nombre del torneo de fútbol (solo torneos activos).")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("jugador1")
        .setDescription("Primer jugador (debe estar registrado en el torneo)")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("jugador2")
        .setDescription("Segundo jugador (debe estar registrado en el torneo)")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("resultado")
        .setDescription("Resultado a eliminar. Usa el formato X-Y (ejemplo: 2-2 o 3-1).")
        .setRequired(true)
    )
    .setDescription("Elimina el registro de un partido y resta las estadísticas."),
  execute: async (interaction) => {
    try {
      const torneoNombre = interaction.options.getString("torneo")?.trim();
      const integrante1Nombre = interaction.options.getString("jugador1")?.trim();
      const integrante2Nombre = interaction.options.getString("jugador2")?.trim();
      const resultado = interaction.options.getString("resultado")?.trim();

      if (!torneoNombre || !integrante1Nombre || !integrante2Nombre || !resultado) {
        await interaction.reply({
          content: "Debes completar todos los campos requeridos.",
          ephemeral: true,
        });
        return;
      }

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

      const torneo = await Torneo.findOne({ nombre: torneoNombre, tipo: "Futbol", activo: true });
      if (!torneo) {
        await interaction.reply({
          content: `No se encontró un torneo de fútbol activo con el nombre "${torneoNombre}".`,
          ephemeral: true,
        });
        return;
      }

      const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_");
      const torneoCollection = mongoose.connection.collection(torneoCollectionName);

      // Buscar el partido exacto
      const partido = await torneoCollection.findOne({
        "integrante1.nombre": integrante1Nombre,
        "integrante2.nombre": integrante2Nombre,
        goles1,
        goles2,
      });

      if (!partido) {
        await interaction.reply({
          content: "No se encontró el partido con esos datos.",
          ephemeral: true,
        });
        return;
      }

      // Eliminar el partido
      await torneoCollection.deleteOne({ _id: partido._id });

      // Restar estadísticas
      let updateJugador1: any = {
        $inc: {
          pj: -1,
          gf: -goles1,
          gc: -goles2,
        },
      };
      let updateJugador2: any = {
        $inc: {
          pj: -1,
          gf: -goles2,
          gc: -goles1,
        },
      };

      if (goles1 > goles2) {
        updateJugador1.$inc.pg = -1;
        updateJugador1.$inc.pts = -3;
        updateJugador2.$inc.pp = -1;
      } else if (goles1 < goles2) {
        updateJugador2.$inc.pg = -1;
        updateJugador2.$inc.pts = -3;
        updateJugador1.$inc.pp = -1;
      } else {
        updateJugador1.$inc.pe = -1;
        updateJugador1.$inc.pts = -1;
        updateJugador2.$inc.pe = -1;
        updateJugador2.$inc.pts = -1;
      }

      updateJugador1.$inc.dg = -(goles1 - goles2);
      updateJugador2.$inc.dg = -(goles2 - goles1);

      await torneoCollection.updateOne(
        { nombre: integrante1Nombre },
        updateJugador1
      );
      await torneoCollection.updateOne(
        { nombre: integrante2Nombre },
        updateJugador2
      );

      await interaction.reply({
        content: `El partido entre **${integrante1Nombre}** y **${integrante2Nombre}** (${goles1}-${goles2}) ha sido eliminado y las estadísticas han sido actualizadas.`,
        ephemeral: false,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al intentar eliminar el partido. Por favor, inténtalo de nuevo más tarde.",
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

      // Autocompletar jugadores solo si ya se eligió el torneo
      if (
        (focusedOption.name === "jugador1" || focusedOption.name === "jugador2") &&
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