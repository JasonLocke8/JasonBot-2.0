import { setGuildOption } from "../functions";
import { Command } from "../types";

const command: Command = {
    name: "prefijo",
    category: "Sistema",
    execute: (message, args) => {
        let prefix = args[1]
        if (!prefix) return message.channel.send("No se ingresó ningún prefijo...")
        if (!message.guild) return;
        setGuildOption(message.guild, "prefix", prefix)
        message.channel.send("Prefijo cambiado con éxito ✅")
    },
    aliases: [],    
    description: "Comando para cambiar el prefijo. Es necesario ser Administrador.",
    usage: "prefijo [símbolo]",
    permissions: ["Administrator"]
}

export default command