import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command: Command = {
  name: "comandos",
  category: "Info",
  execute: (message, args) => {
    message.channel.send(
      `Los comandos disponibles son los siguientes:\n\n**-jason** Pequeño saludo del bot.\n**-lan** Información sobre la siguiente LAN\n**-lineup (agente) (mapa)** Muestra varios lineups de ese Agente en ese Mapa (en proceso)\n\nTambién existen los comandos con "/" como:\n\n**/valorant (mapa)** Muestra un posible team de ese mapa\n**/clip** Muestra tu clip para que lo voten`
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
