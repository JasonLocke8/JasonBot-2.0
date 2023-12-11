import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "valorant",
    category: "Function",
    options: ["bind", "heaven", "sunset"],
    choices: ["sunset", "lotus", "pearl", "heaven", "ascent", "icebox", "split", "bind", "fracture", "breeze"],
    execute: (message, args) => {

        let mapas = ["sunset", "lotus", "pearl", "heaven", "ascent", "icebox", "split", "bind", "fracture", "breeze"]

        args = message.content.slice(process.env.PREFIX.length).trim().split(' ');
	    const comando = args.shift()

        const embedMap = new EmbedBuilder()

        if (args[0] == undefined){
            message.channel.send('No ingresaste ningún parametro, capo')
            return
        } else if (args[0] == "bind") {
            embedMap.setTitle('🗺️ Bind')
            embedMap.addFields({ name: '- Raze\n- Omen (o Brimstone)\n- Chypher\n- Skye\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt8538036a309525ae/5ebc470bfd85ad7411ce6b50/bind-featured.png')
        } else if (args[0] == "sunset") {
            embedMap.setTitle('🗺️ Sunset')
            embedMap.addFields({ name: '- Raze\n- Omen (o Brimstone)\n- Chypher\n- Skye\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt9053fb44094718e6/64e934091ab3c3ccb703dd43/SUNSET_LoadingScreen_Desktop.png')            
        } else if (args[0] == "") {
            
        }
        
        embedMap.setColor(0xff0000)
        embedMap.setDescription('Agentes recomendados para este mapa:')
        embedMap.setThumbnail('https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png')
        embedMap.setFooter({ text: 'via JasonBot', iconURL: 'https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png' });        

        message.channel.send({ embeds: [embedMap] })

    },
    cooldown: 1,
    aliases: ["v"],
    usage: "valorant [mapa]",
    description: "Muestra un posible team del mapa seleccionado.",
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers] // to test
}

export default command
