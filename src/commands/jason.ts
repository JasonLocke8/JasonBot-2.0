import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "jason",
    execute: (message, args) => {
        let toGreet = message.mentions.members?.first()
        message.channel.send(`Hola, ${toGreet ? toGreet.user.username : message.member?.user.username}! Volvió el peor bot de todo Discord!
        
Para ver los comandos ingresa: -comandos`)
    },
    cooldown: 10,
    aliases: ["j"],
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers] // to test
}

export default command