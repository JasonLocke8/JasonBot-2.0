import { SlashCommandBuilder, TextChannel, EmbedBuilder } from "discord.js"
import { SlashCommand } from "../types"
import { read } from "fs"

let opciones = [
    { name: "sunset", value: "Sunset", composition: "- Raze\n- Omen\n- Chamber (o Deadlock)\n- Viper\n- Skye", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt9053fb44094718e6/64e934091ab3c3ccb703dd43/SUNSET_LoadingScreen_Desktop.png" },
    { name: "lotus", value: "Lotus", composition: "- Raze\n- Brimstone (u Omen)\n- Cypher (o KillJoy)\n- Skye (o Geeko o Sova)\n- Breach", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltaae67d0ec5006ef5/63b8a78d28c9fb7a1880a9e2/Lotus_MapWebsite_Web.png" },
    { name: "pearl", value: "Pearl", composition: "- Neon\n- Harbor (o Brimstone u Omen)\n- Killjoy\n- Skye (o Kay-o)\n- Sova", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltd0a2437fb09ebde4/62a2805b58931557ed9f7c9e/PearlLoadingScreen_MapFeaturedImage_930x522.png" },
    { name: "haven", value: "Haven", composition: "- Raze\n- Omen (o Brimstone)\n- Cypher\n- Skye (o Breach)\n- Sova", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt8afb5b8145f5e9b2/5ebc46f7b8c49976b71c0bc5/haven-featured.png" },
    { name: "ascent", value: "Ascent", composition: "- Raze\n- Brimstone\n- Killjoy (o Chyper)\n- Skye (o Kay-o)\n- Sova", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blta9b912e1a1b59aa4/5ebc471cfa550001f72bcb13/ascent-featured.png" },
    { name: "icebox", value: "Icebox", composition: "- Raze (o Reyna)\n- Viper (o Brimstone u Omen)\n- Killjoy\n- Sage\n- Sova", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltde02911a015d7ef9/5f80d2851f5f6d4173b4e49d/Icebox_transparentbg_for_Web.png" },
    { name: "split", value: "Split", composition: "- Raze (o Reyna)\n- Omen (o Brimstone)\n- Cypher (o Killjoy)\n- Kay-o (o Skye)\n- Sova (o Fade)", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltd188c023f88f7d91/5ebc46db20f7727335261fcd/split-featured.png" },
    { name: "bind", value: "Bind", composition: "- Raze\n- Omen (o Brimstone)\n- Cypher\n- Skye\n- Sova", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt8538036a309525ae/5ebc470bfd85ad7411ce6b50/bind-featured.png" },
    { name: "fracture", value: "Fracture", composition: "- Neon (o Raze)\n- Viper (o Harbor)\n- Killjoy (o Cypher)\n- Breach\n- Sova", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltf4485163c8c5873c/6131b23e9db95e7ff74b6393/Valorant_FRACTURE_Minimap_Alpha_web.png" },
    { name: "breeze", value: "Breeze", composition: "- Neon\n- Viper\n- Cypher\n- Skye (o Kay-o)\n- Sova", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltb03d2e4867f2e324/607f995892f0063e5c0711bd/breeze-featured_v1.png" },
    { name: "abyss", value: "Abyss", composition: "- Indefinido\n- Indefinido\n- Indefinido\n- Indefinido\n- Indefinido", image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltb03d2e4867f2e324/607f995892f0063e5c0711bd/breeze-featured_v1.png" },
]

const command : SlashCommand = {

    command: new SlashCommandBuilder()
        .setName("valorant")
        .addStringOption(option => {
            return option
            .setName("mapa")
            .setDescription("Nombre del mapa")
            .setRequired(true)
            .setAutocomplete(true)
        })
        
        .setDescription("Muestra un posible team del mapa seleccionado."),

    autocomplete: async (interaction) => {
        try {
            const focusedValue = interaction.options.getFocused();
            const choices = opciones
            let filtered: { name: string, value: string }[] = []
            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                if (choice.name.includes(focusedValue)) filtered.push(choice);
            }
            await interaction.respond(
                filtered.map(choice => ({ name: choice.value, value: choice.name }))
            );
        } catch (error) {
            console.error(error);
        }
    },

    execute: async (interaction) => {
        try {
            const mapa = interaction.options.getString("mapa");
            const opcion = opciones.find(op => op.name === mapa);
            if (!opcion) {
                await interaction.reply({ content: "Mapa no encontrado.", ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`🗺️ ${opcion.value}`)
                .setDescription('Agentes recomendados para este mapa:')
                .addFields({ name: ''+opcion.composition, value: '\u200B' })
                .setImage(opcion.image)
                .setColor("#0xff0000")
                .setThumbnail('https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png')
                .setFooter({ text: 'via JasonBot', iconURL: 'https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png' })
                ;

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Ocurrió un error al ejecutar el comando.", ephemeral: true });
        }
    }
}

export default command;