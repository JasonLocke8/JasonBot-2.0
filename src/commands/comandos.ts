import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command: Command = {
  name: "comandos",
  category: "Info",
  execute: (message, args) => {
    message.channel.send(
      `Los comandos disponibles son los siguientes:\n\n
      **-jason** Pequeño saludo del bot.\n
      **-lan** Información sobre la siguiente LAN\n\n
      También existen los comandos con "/" como:\n\n
      **/clear (número)** Borra X mensajes\n
      **/ping** Muestra el ping del bot\n
      **/clip** Muestra tu clip para que lo voten\n
      **/valorant (mapa)** Muestra un posible team de ese mapa\n
      **/creartorneo (nombre, juego, cantEquipos)** Crea un torneo\n
      **/eliminartorneo (nombre)** Elimina un torneo\n
      **/ingresar (nombreTorneo, KDA)** Ingresa tu KDA a un torneo\n
      **/mostrar (nombreTorneo)** Muestra el leaderboard del torneo\n
      `
    );
  },
  cooldown: 20,
  aliases: ["ayuda", "cmd", "cmds"],
  usage: "comando [comando]",
  description:
    "Página de ayuda, donde se muestran los comandos o explica un comando en específico",
  permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers], // to test
};

export default command;
