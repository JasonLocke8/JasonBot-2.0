import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "valorant",
    category: "Function",
    options: ["sunset", "lotus", "pearl", "heaven", "ascent", "icebox", "split", "bind", "fracture", "breeze"],
    choices: ["sunset", "lotus", "pearl", "heaven", "ascent", "icebox", "split", "bind", "fracture", "breeze"],
    execute: (message, args) => {

        args = message.content.slice(process.env.PREFIX.length).trim().split(' ');
	    args.shift()

        const embedMap = new EmbedBuilder()

        if (args[0] == undefined){
            message.channel.send('No ingresaste ningún mapa, capo')
            return
        } else if (args[0] == "bind") {
            embedMap.setTitle('🗺️ Bind')
            embedMap.addFields({ name: '- Raze\n- Omen (o Brimstone)\n- Chypher\n- Skye\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt8538036a309525ae/5ebc470bfd85ad7411ce6b50/bind-featured.png')
        } else if (args[0] == "sunset") {
            embedMap.setTitle('🗺️ Sunset')
            embedMap.addFields({ name: '- Raze\n- Omen\n- Chamber (o Deadlock)\n- Viper\n- Skye', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt9053fb44094718e6/64e934091ab3c3ccb703dd43/SUNSET_LoadingScreen_Desktop.png')            
        } else if (args[0] == "lotus") {
            embedMap.setTitle('🗺️ Lotus')
            embedMap.addFields({ name: '- Raze\n- Brimstone (u Omen)\n- Chypher (o KillJoy)\n- Skye (o Geeko o Sova)\n- Breach', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltaae67d0ec5006ef5/63b8a78d28c9fb7a1880a9e2/Lotus_MapWebsite_Web.png')            
        } else if (args[0] == "pearl") {
            embedMap.setTitle('🗺️ Pearl')
            embedMap.addFields({ name: '- Neon\n- Harbor (o Brimstone u Omen)\n- Killjoy\n- Skye (o Kay-o)\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltd0a2437fb09ebde4/62a2805b58931557ed9f7c9e/PearlLoadingScreen_MapFeaturedImage_930x522.png')
        } else if (args[0] == "heaven") { 
            embedMap.setTitle('🗺️ Heaven')
            embedMap.addFields({ name: '- Raze\n- Omen (o Brimstone)\n- Chypher\n- Skye (o Breach)\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt8afb5b8145f5e9b2/5ebc46f7b8c49976b71c0bc5/haven-featured.png')
        } else if (args[0] == "ascent") {
            embedMap.setTitle('🗺️ Ascent')
            embedMap.addFields({ name: '- Raze\n- Brimstone\n- Killjoy (o Chyper)\n- Skye (o Kay-o)\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blta9b912e1a1b59aa4/5ebc471cfa550001f72bcb13/ascent-featured.png')
        } else if (args[0] == "icebox") {
            embedMap.setTitle('🗺️ IceBox')
            embedMap.addFields({ name: '- Raze (o Reyna)\n- Viper (o Brimstone u Omen)\n- Killjoy\n- Sage\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltde02911a015d7ef9/5f80d2851f5f6d4173b4e49d/Icebox_transparentbg_for_Web.png')
        } else if (args[0] == "split") {
            embedMap.setTitle('🗺️ Split')
            embedMap.addFields({ name: '- Raze (o Reyna)\n- Omen (o Brimstone)\n- Chypher (o Killjoy)\n- Kay-o (o Skye)\n- Sova (o Fade)', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltd188c023f88f7d91/5ebc46db20f7727335261fcd/split-featured.png')
        } else if (args[0] == "fracture") {
            embedMap.setTitle('🗺️ Fracture')
            embedMap.addFields({ name: '- Neon (o Raze)\n- Viper (o Harbor)\n- Killjoy (o Chypher)\n- Breach\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltf4485163c8c5873c/6131b23e9db95e7ff74b6393/Valorant_FRACTURE_Minimap_Alpha_web.png')
        } else if (args[0] == "breeze") {
            embedMap.setTitle('🗺️ Breeze')
            embedMap.addFields({ name: '- Neon\n- Viper\n- Chypher\n- Skye (o Kay-o)\n- Sova', value: '\u200B' })
            embedMap.setImage('https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltb03d2e4867f2e324/607f995892f0063e5c0711bd/breeze-featured_v1.png')
        }
        
        embedMap.setColor(0xff0000)
        embedMap.setDescription('Agentes recomendados para este mapa:')
        embedMap.setThumbnail('https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png')
        embedMap.setFooter({ text: 'via JasonBot', iconURL: 'https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png' });        

        message.channel.send({ embeds: [embedMap] })

    },
    cooldown: 5,
    aliases: ["v"],
    usage: "valorant [mapa]",
    description: "Muestra un posible team del mapa seleccionado.",
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers]
}

export default command