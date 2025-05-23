import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { SlashCommand } from "../types";

const R6StatsCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("r6stats")
    .setDescription("Muestra estadísticas de Rainbow Six Siege de un jugador.")
    .addStringOption((option) =>
      option
        .setName("jugador")
        .setDescription("Nombre del jugador de Ubisoft")
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async (interaction) => {
    const jugador = interaction.options.getString("jugador", true);
    const plataforma = "ubi";
    const url = `https://r6.tracker.network/r6siege/profile/${plataforma}/${encodeURIComponent(
      jugador
    )}/overview`;

    await interaction.deferReply();

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
        ],
      });
      const page = await browser.newPage();

      // Finge ser un navegador real
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
      });
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        delete window.navigator.__proto__.webdriver;
      });

      await page.goto(url, { waitUntil: "networkidle2" });

      // Espera a que cargue el bloque de rango
      await page.waitForSelector(".playlist-summary .truncate", {
        timeout: 10000,
      });

      const content = await page.content();
      await browser.close();

      const $ = cheerio.load(content);

      // Inicializar variables
      let rango = "Desconocido";
      let mmr = "N/A";
      let rankImg =
        "https://trackercdn.com/cdn/tracker.gg/r6/ranks/s28/small/unranked.png";
      let kd = "N/A";
      let hs = "N/A";
      let rankedWinrate = "N/A";
      let rankedWins = "N/A";
      let rankedLosses = "N/A";
      let matches = "N/A";

      // Extraer rango
      rango = $(".playlist-summary .truncate").first().text().trim() || rango;
      // Extraer MMR
      mmr = $(".playlist-summary .rank-points").first().text().trim() || mmr;
      // Extraer imagen de rango
      rankImg =
        $(".playlist-summary .rank-image").first().attr("src") || rankImg;

      // KD
      kd =
        $(
          "section.season-overview.v3-card > div.v3-card__body.v3-card__body--v2\\.5 > div.relative.px-4.-mt-6 > div > div:nth-child(1) > div > div > div:nth-child(2) > span.stat-value.stat-value--text"
        )
          .first()
          .text()
          .trim() || kd;

      // Winrate
      rankedWinrate =
        $(
          "section.season-overview.v3-card > div.v3-card__body.v3-card__body--v2\\.5 > div.relative.px-4.-mt-6 > div > div:nth-child(3)"
        )
          .first()
          .text()
          .trim() || rankedWinrate;

      // Victorias
      rankedWins =
        $(
          "section.season-overview.v3-card > div.v3-card__body.v3-card__body--v2\\.5 > div.relative.px-4.-mt-6 > div > div:nth-child(4) > div > div > div:nth-child(2) > span.stat-value.stat-value--text"
        )
          .first()
          .text()
          .trim() || rankedWins;

      // Matches
      matches =
        $(
          "section.season-overview.v3-card > div.v3-card__body.v3-card__body--v2\\.5 > div.p-2\\.5 > div > div:nth-child(1) > div > div:nth-child(2) > span.stat-value.stat-value--text"
        )
          .first()
          .text()
          .trim() || matches;

      // Losses
      rankedLosses =
        $(
          "section.season-overview.v3-card > div.v3-card__body.v3-card__body--v2\\.5 > div.p-2\\.5 > div > div:nth-child(2) > div > div:nth-child(2) > span.stat-value.stat-value--text"
        )
          .first()
          .text()
          .trim() || rankedLosses;

      // Headshot %
      const allStatsBlock = $(".playlist-all__stats");
      if (allStatsBlock.length > 0) {
        allStatsBlock.find(".stat").each((_, el) => {
          const statName = $(el).find(".stat-name").text().trim();
          const statValue = $(el).find(".stat-value").text().trim();
          if (statName === "HS%") hs = statValue;
        });
      }

      // Limpiar valores para mostrar solo el número y el símbolo %
      kd = kd.match(/[\d.,]+/) ? kd.match(/[\d.,]+/)![0] : kd;
      rankedWinrate = rankedWinrate.match(/[\d.,]+%/)
        ? rankedWinrate.match(/[\d.,]+%/)![0]
        : rankedWinrate;
      rankedWins = rankedWins.match(/[\d,]+/)
        ? rankedWins.match(/[\d,]+/)![0]
        : rankedWins;
      rankedLosses = rankedLosses.match(/[\d,]+/)
        ? rankedLosses.match(/[\d,]+/)![0]
        : rankedLosses;
      matches = matches.match(/[\d,]+/) ? matches.match(/[\d,]+/)![0] : matches;

      // Primer embed (stats principales)
      const embed = new EmbedBuilder()
        .setTitle(`Estadísticas de ${jugador}`)
        .setURL(url)
        .setColor(0x0099ff)
        .setThumbnail(rankImg)
        .addFields(
          { name: "Rango", value: rango, inline: true },
          { name: "MMR", value: mmr, inline: true },
          { name: "K/D", value: kd, inline: true },
          { name: "Headshot %", value: hs, inline: true },
          { name: "Partidas", value: matches, inline: true }
        )
        .setFooter({ text: "Fuente: r6.tracker.network" });

      // Segundo embed (detalles Ranked)
      const embedRanked = new EmbedBuilder()
        .setTitle("Partidas Clasificatorias")
        .setColor(0x0099ff)
        .addFields(
          { name: "Victorias", value: rankedWins, inline: true },
          { name: "Derrotas", value: rankedLosses, inline: true },
          { name: "Winrate", value: rankedWinrate, inline: true }
        );

      await interaction.editReply({ embeds: [embed, embedRanked] });
    } catch (error: any) {
      await interaction.editReply(
        "Ocurrió un error al obtener las estadísticas."
      );
    }
  },
  cooldown: 10,
};

export default R6StatsCommand;