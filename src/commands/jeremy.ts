import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "jeremy",
    execute: (message, args) => {
        let toGreet = message.mentions.members?.first()
        message.channel.send(`¿Jeremy? Tremeeeendo puto`)
    },
    cooldown: 10,
    aliases: ["jere"],
    description: "Información sobre Jeremy",
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers] // to test
}

export default command