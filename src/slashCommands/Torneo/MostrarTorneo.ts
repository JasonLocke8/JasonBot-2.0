import {
    SlashCommandBuilder,
    EmbedBuilder,
    AutocompleteInteraction,
} from "discord.js";
import { SlashCommand } from "../../types";
import Torneo from "../../schemas/Torneo";
import mongoose from "mongoose";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("mostrar")
        .addStringOption((option) =>
            option
                .setName("nombre")
                .setDescription("El nombre del torneo a mostrar.")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDescription("Muestra los datos de un torneo en una tabla."),
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

            // Normalizar el nombre del torneo para buscar la colección
            const torneoCollectionName = torneoNombre.toLowerCase().replace(/\s+/g, "_");
            const torneoCollection = mongoose.connection.collection(torneoCollectionName);

            // Verificar si la colección existe
            const torneoExists = await torneoCollection.stats().catch(() => null);
            if (!torneoExists) {
                await interaction.reply({
                    content: `No se encontró un torneo con el nombre "${torneoNombre}".`,
                    ephemeral: true,
                });
                return;
            }

            // Obtener los datos del torneo
            const registros = await torneoCollection.find().toArray();

            if (registros.length === 0) {
                await interaction.reply({
                    content: `No hay datos registrados para el torneo "${torneoNombre}".`,
                    ephemeral: true,
                });
                return;
            }

            // Calcular los puntos y agrupar por jugador
            const jugadores = new Map<string, { usuarioTag: string; puntos: number }>();
            const equipos = new Map<string, number>(); // Mapa para agrupar puntos por equipo

            registros.forEach((registro) => {
                const kdaParts = registro.kda.split("/");
                const kills = parseInt(kdaParts[0], 10) || 0;
                const deaths = parseInt(kdaParts[1], 10) || 0;
                const assists = parseInt(kdaParts[2], 10) || 0;

                // Calcular puntos: 2 por Kill, -1 por Death, 1 por Assist
                const puntos = kills * 2 - deaths + assists;

                // Agrupar puntos por jugador
                if (jugadores.has(registro.usuarioId)) {
                    const jugador = jugadores.get(registro.usuarioId)!;
                    jugador.puntos += puntos;
                } else {
                    jugadores.set(registro.usuarioId, {
                        usuarioTag: registro.usuarioTag,
                        puntos,
                    });
                }
            });

            // Obtener los roles que representan equipos
            const guild = interaction.guild;
            if (!guild) {
                await interaction.reply({
                    content: "No se pudo acceder a la información del servidor.",
                    ephemeral: true,
                });
                return;
            }

            const roles = guild.roles.cache.filter((role) =>
                role.name.startsWith(`${torneoNombre}:`)
            );

            if (roles.size === 0) {
                await interaction.reply({
                    content: `No se encontraron roles de equipos para el torneo "${torneoNombre}".`,
                    ephemeral: true,
                });
                return;
            }

            // Calcular los puntos por equipo sumando los puntos de sus integrantes
            roles.forEach((role) => {
                const equipoNombre = role.name.split(":")[1].trim(); // Extraer el nombre del equipo
                let puntosEquipo = 0;

                // Filtrar los miembros que tienen este rol
                const miembros = guild.members.cache.filter((member) =>
                    member.roles.cache.has(role.id)
                );

                // Sumar los puntos de los integrantes del equipo
                miembros.forEach((miembro) => {
                    const jugador = jugadores.get(miembro.id);
                    if (jugador) {
                        puntosEquipo += jugador.puntos;
                    }
                });

                // Actualizar el mapa de equipos con los puntos calculados
                equipos.set(equipoNombre, puntosEquipo);
            });

            // Crear la tabla de puntos por jugador
            let tablaJugadores = "```\n";
            tablaJugadores += "Usuario            | Puntos\n";
            tablaJugadores += "-------------------|-------\n";
            jugadores.forEach((jugador) => {
                const usuario = jugador.usuarioTag.padEnd(18, " ");
                const puntos = jugador.puntos.toString().padEnd(7, " ");
                tablaJugadores += `${usuario}| ${puntos}\n`;
            });
            tablaJugadores += "```";

            // Crear la tabla de puntos por equipo ordenada por puntos
            let tablaEquipos = "```\n";
            tablaEquipos += "Equipo             | Puntos\n";
            tablaEquipos += "-------------------|-------\n";

            // Ordenar los equipos por puntos de mayor a menor
            const equiposOrdenados = Array.from(equipos.entries()).sort((a, b) => b[1] - a[1]);

            equiposOrdenados.forEach(([equipo, puntos]) => {
                const equipoNombre = equipo.padEnd(18, " ");
                const puntosStr = puntos.toString().padEnd(7, " ");
                tablaEquipos += `${equipoNombre}| ${puntosStr}\n`;
            });
            tablaEquipos += "```";

            // Crear el embed
            const embed = new EmbedBuilder()
                .setTitle(`Leaderboard: ${torneoNombre}`)
                //.setDescription(`**Puntos por Jugador:**\n${tablaJugadores}\n**Puntos por Equipo:**\n${tablaEquipos}`)
                .setDescription("\n```\nPuntos por jugador y por equipo:\n```\n")
                .addFields({
                    name: "Jugadores:",
                    value: "" + tablaJugadores,
                    inline: false,
                  })
                  .addFields({
                    name: "Equipos:",
                    value: "" + tablaEquipos,
                    inline: false,
                  })
                .setThumbnail("https://i.imgur.com/Oo4KE52.png")
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Ocurrió un error al intentar mostrar los datos del torneo.",
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