import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { SlashCommand } from "../../types";
import Torneo from "../../schemas/Torneo";
import mongoose from "mongoose";

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
      if (!nombre) {
        await interaction.reply({
          content: "El nombre del torneo es obligatorio.",
          ephemeral: true,
        });
        return;
      }

      const cantidadEquipos = interaction.options.getInteger("cantidadequipos");
      const juego = interaction.options.getString("juego");
      const canalId = interaction.channel?.id;

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
        content: `🏆 Torneo "${nombre}" creado con éxito. Participarán ${cantidadEquipos} equipos y se jugará ${juego}. Para eliminarlo, usa **/eliminarTorneo**.`,
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
        const nuevoTorneo = new Torneo({
          nombre,
          juego,
          cantidadEquipos,
          mensajeId: sentMessage.id,
          canalId,
        });
        await nuevoTorneo.save();

        for (const emoji of emojis.slice(0, cantidadEquipos)) {
          await sentMessage.react(emoji);
        }
      }

      // Crear la colección en la base de datos existente
      const torneoCollectionName = nombre.toLowerCase().replace(/\s+/g, "_"); // Normalizar el nombre

      // Crear la colección vacía sin insertar documentos
      const db = mongoose.connection.db;
      const collections = await db.listCollections({ name: torneoCollectionName }).toArray();
      if (collections.length === 0) {
        await db.createCollection(torneoCollectionName); // Crear la colección si no existe
      }

      // Crear la categoría y los canales dentro de ella
      const guild = interaction.guild;
      if (!guild) {
        await interaction.followUp({
          content: "No se pudo acceder al servidor para crear los canales.",
          ephemeral: true,
        });
        return;
      }

      const categoryName = `Torneo: ${nombre}`;
      const category = await guild.channels.create({
        name: categoryName,
        type: 4, // Tipo de canal: Categoría
      });

      if (category) {
        // Crear los canales de texto dentro de la categoría
        await guild.channels.create({
          name: "general",
          type: 0, // Tipo de canal: Texto
          parent: category.id,
          topic: "Canal general para los participantes del torneo.",
        });

        await guild.channels.create({
          name: "leaderboard",
          type: 0, // Tipo de canal: Texto
          parent: category.id,
          topic: "Canal para mostrar el leaderboard del torneo.",
        });

        await guild.channels.create({
          name: "ingreso-de-puntos",
          type: 0, // Tipo de canal: Texto
          parent: category.id,
          topic: "Canal para ingresar puntos usando el comando /ingresar.",
        });

        // Crear los canales de voz dentro de la categoría
        await guild.channels.create({
          name: "General",
          type: 2, // Tipo de canal: Voz
          parent: category.id,
        });

        for (let i = 1; i <= cantidadEquipos; i++) {
          await guild.channels.create({
            name: `Equipo ${i}`,
            type: 2, // Tipo de canal: Voz
            parent: category.id,
          });
        }
      }

    } catch (error) {
      console.error(error);

      // Evitar múltiples respuestas a la interacción
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "Ocurrió un error al crear el torneo.",
          ephemeral: true,
        });
      }
    }
  },
  cooldown: 10,
};

export default command;