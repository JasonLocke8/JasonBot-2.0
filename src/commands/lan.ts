import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "lan",
    execute: (message, args) => {
        let toGreet = message.mentions.members?.first()
        message.channel.send(`La proxima LAN todavía no esta pactada.`)
    },
    cooldown: 10,
    aliases: [],
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers] // to test
}

export default command