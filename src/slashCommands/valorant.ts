import { SlashCommandBuilder, TextChannel, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { read } from "fs";

let opciones = [
  {
    name: "sunset",
    value: "Sunset",
    composition: "- Raze\n- Omen\n- Chamber (o Deadlock)\n- Viper\n- Skye",
    image:
      "https://static.wikia.nocookie.net/valorant/images/5/5c/Loading_Screen_Sunset.png/revision/latest?cb=20230829125442",
    controlador: "Breach\nOmen",
    duelista: "Neon",
    centinela: "Cypher",
    iniciador: "Sova",
  },
  {
    name: "lotus",
    value: "Lotus",
    composition:
      "- Raze\n- Brimstone (u Omen)\n- Cypher (o KillJoy)\n- Skye (o Geeko o Sova)\n- Breach",
    image:
      "https://static.wikia.nocookie.net/valorant/images/d/d0/Loading_Screen_Lotus.png/revision/latest?cb=20230106163526",
    controlador: "Omen\nViper",
    duelista: "Raze",
    centinela: "Killjoy",
    iniciador: "Fade",
  },
  {
    name: "pearl",
    value: "Pearl",
    composition:
      "- Neon\n- Harbor (o Brimstone u Omen)\n- Killjoy\n- Skye (o Kay-o)\n- Sova",
    image:
      "https://static.wikia.nocookie.net/valorant/images/a/af/Loading_Screen_Pearl.png/revision/latest?cb=20220622132842",
    controlador: "Astra",
    duelista: "Neon",
    centinela: "Killjoy",
    iniciador: "Kay/o\nFade",
  },
  {
    name: "haven",
    value: "Haven",
    composition:
      "- Raze\n- Omen (o Brimstone)\n- Cypher\n- Skye (o Breach)\n- Sova",
    image:
      "https://static.wikia.nocookie.net/valorant/images/7/70/Loading_Screen_Haven.png/revision/latest?cb=20200620202335",
    controlador: "Breach\nOmen",
    duelista: "Neon",
    centinela: "Cypher",
    iniciador: "Sova",
  },
  {
    name: "ascent",
    value: "Ascent",
    composition:
      "- Raze\n- Brimstone\n- Killjoy (o Chyper)\n- Skye (o Kay-o)\n- Sova",
    image:
      "https://static.wikia.nocookie.net/valorant/images/e/e7/Loading_Screen_Ascent.png/revision/latest/scale-to-width-down/350?cb=20200607180020",
    controlador: "Omen",
    duelista: "Jett",
    centinela: "Killjoy",
    iniciador: "Sova\nKay/o",
  },
  {
    name: "icebox",
    value: "Icebox",
    composition:
      "- Raze (o Reyna)\n- Viper (o Brimstone u Omen)\n- Killjoy\n- Sage\n- Sova",
    image:
      "https://static.wikia.nocookie.net/valorant/images/1/13/Loading_Screen_Icebox.png/revision/latest/scale-to-width-down/350?cb=20201015084446",
    controlador: "Viper",
    duelista: "Jett",
    centinela: "Killjoy",
    iniciador: "Sova\nGekko",
  },
  {
    name: "split",
    value: "Split",
    composition:
      "- Raze (o Reyna)\n- Omen (o Brimstone)\n- Cypher (o Killjoy)\n- Kay-o (o Skye)\n- Sova (o Fade)",
    image:
      "https://static.wikia.nocookie.net/valorant/images/d/d6/Loading_Screen_Split.png/revision/latest?cb=20230411161807",
    controlador: "Omen\nViper",
    duelista: "Raze",
    centinela: "Cypher",
    iniciador: "Skye",
  },
  {
    name: "bind",
    value: "Bind",
    composition: "- Raze\n- Omen (o Brimstone)\n- Cypher\n- Skye\n- Sova",
    image:
      "https://static.wikia.nocookie.net/valorant/images/2/23/Loading_Screen_Bind.png/revision/latest?cb=20200620202316",
    controlador: "Brimstone\nViper",
    duelista: "Raze",
    centinela: "Cypher",
    iniciador: "Skye",
  },
  {
    name: "fracture",
    value: "Fracture",
    composition:
      "- Neon (o Raze)\n- Viper (o Harbor)\n- Killjoy (o Cypher)\n- Breach\n- Sova",
    image:
      "https://static.wikia.nocookie.net/valorant/images/f/fc/Loading_Screen_Fracture.png/revision/latest/scale-to-width-down/350?cb=20210908143656",
    controlador: "Viper",
    duelista: "Neon",
    centinela: "Killjoy",
    iniciador: "Breach\nSova",
  },
  {
    name: "breeze",
    value: "Breeze",
    composition: "- Neon\n- Viper\n- Cypher\n- Skye (o Kay-o)\n- Sova",
    image:
      "https://static.wikia.nocookie.net/valorant/images/1/10/Loading_Screen_Breeze.png/revision/latest/scale-to-width-down/350?cb=20210427160616",
    controlador: "Viper",
    duelista: "Neon",
    centinela: "Cypher",
    iniciador: "Sova\nSkye",
  },
  {
    name: "abyss",
    value: "Abyss",
    composition:
      "- Indefinido\n- Indefinido\n- Indefinido\n- Indefinido\n- Indefinido",
    image:
      "https://static.wikia.nocookie.net/valorant/images/6/61/Loading_Screen_Abyss.png/revision/latest?cb=20240730145619",
    controlador: "Omen",
    duelista: "Jett",
    centinela: "Cypher",
    iniciador: "Sova\nKay/o",
  },
];

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("valorant")
    .addStringOption((option) => {
      return option
        .setName("mapa")
        .setDescription("Nombre del mapa")
        .setRequired(true)
        .setAutocomplete(true);
    })

    .setDescription("Muestra un posible team del mapa seleccionado."),

  autocomplete: async (interaction) => {
    try {
      const focusedValue = interaction.options.getFocused();
      const choices = opciones;
      let filtered: { name: string; value: string }[] = [];
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (choice.name.includes(focusedValue)) filtered.push(choice);
      }
      await interaction.respond(
        filtered.map((choice) => ({ name: choice.value, value: choice.name }))
      );
    } catch (error) {
      console.error(error);
    }
  },

  execute: async (interaction) => {
    try {
      const mapa = interaction.options.getString("mapa");
      const opcion = opciones.find((op) => op.name === mapa);
      if (!opcion) {
        await interaction.reply({
          content: "Mapa no encontrado.",
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`🗺️  ${opcion.value}`)
        .setDescription("\n```\nAgentes recomendados para este mapa:\n```\n")
        .addFields({ name: "\n", value: "\n", inline: false })
        .addFields({
          name: "Duelista:",
          value: "" + opcion.duelista,
          inline: true,
        })
        .addFields({
          name: "Iniciador:",
          value: "" + opcion.iniciador,
          inline: true,
        })
        .addFields({ name: "\n", value: "\n", inline: false })
        .addFields({
          name: "Controlador:",
          value: "" + opcion.controlador,
          inline: true,
        })
        .addFields({
          name: "Centinela:",
          value: "" + opcion.centinela,
          inline: true,
        })
        .setImage(opcion.image)
        .setColor("#0xff0000")
        .setThumbnail(
          "https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png"
        )
        .setFooter({
          text: "via JasonBot",
          iconURL:
            "https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png",
        });
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Ocurrió un error al ejecutar el comando.",
        ephemeral: true,
      });
    }
  },
};

export default command;
