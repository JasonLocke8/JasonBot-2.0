import {
  SlashCommandBuilder,
  ChannelType,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra el ping con el bot."),
  execute: (interaction) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "JasonBot" })
          .setDescription("```\nEl ping es de " + interaction.client.ws.ping + " ms```")
          .setColor("Green"),
      ],
    });
  },
  cooldown: 10,
};

export default command;
