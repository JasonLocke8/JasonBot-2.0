import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { color } from "../functions";
import { Command, SlashCommand } from "../types";

const loadFilesRecursively = (dir: string): string[] => {
    let files: string[] = [];
    readdirSync(dir).forEach((file) => {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
            files = files.concat(loadFilesRecursively(fullPath));
        } else if (file.endsWith(".js")) {
            files.push(fullPath);
        }
    });
    return files;
};

module.exports = (client: Client) => {
    const slashCommands: SlashCommandBuilder[] = [];
    const commands: Command[] = [];

    const slashCommandsDir = join(__dirname, "../slashCommands");
    const commandsDir = join(__dirname, "../commands");

    // Cargar comandos con barra
    loadFilesRecursively(slashCommandsDir).forEach((file) => {
        const command: SlashCommand = require(file).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
    });

    // Cargar comandos con prefijo
    loadFilesRecursively(commandsDir).forEach((file) => {
        const command: Command = require(file).default;
        commands.push(command);
        client.commands.set(command.name, command);
    });

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: slashCommands.map((command) => command.toJSON()),
    })
        .then((data: any) => {
            console.log(color("text", `${color("variable", data.length)} comando(s) con barra ✅`));
            console.log(color("text", `${color("variable", commands.length)} comando(s) con prefijo ✅`));
        })
        .catch((e) => {
            console.log(e);
        });
};