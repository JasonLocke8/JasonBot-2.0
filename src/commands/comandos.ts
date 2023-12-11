import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "comandos",
    category: "Info",
    execute: (message, args) => {
        message.channel.send(`Los comandos disponibles son los siguientes:
        
**-jason** Pequeño saludo del bot.
**-lan** Información sobre la siguiente LAN
**-mensaje** Crea un Embeded Message
**-valorant (mapa)** Muestra un posible team de ese mapa (también sirve -v (mapa))
**-lineup (agente) (mapa)** Muestra varios lineups de ese Agente en ese Mapa 
**-jeremy** No hay mucho que explicar...`)
    },
    cooldown: 20,
    aliases: ["ayuda", "cmd", "cmds"],
    usage: "comando [comando]",
    description: "Página de ayuda, donde se muestran los comandos o explica un comando en específico",
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers] // to test
}

export default command