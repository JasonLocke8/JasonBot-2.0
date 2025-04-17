import { Events, MessageReaction, User } from "discord.js";

interface ReactionEvent {
    name: typeof Events.MessageReactionRemove;
    execute: (reaction: MessageReaction, user: User) => Promise<void>;
}

const reactionEvent: ReactionEvent = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        // Ignorar reacciones del propio bot
        if (user.bot) return;

        // Verificar si el mensaje tiene un embed con el título "Torneo!"
        const embed = reaction.message.embeds[0];
        if (!embed || embed.title !== "Torneo!") {
            return;
        }

        // Obtener el nombre del torneo desde el embed
        const torneoNombre = embed.description?.match(/El torneo \*\*(.+?)\*\*/)?.[1] || null;
        if (!torneoNombre) {
            return;
        }

        // Verificar si el emoji está permitido
        const allowedEmojis = [
            "🐵", "🐶", "🐺", "🦝", "🐱", "🦁", "🐯", "🐴", "🦄", "🐮",
            "🐷", "🐭", "🐻", "🐨", "🐥", "🐧", "🐸", "🐬", "🐌", "🐝"
        ];
        if (!reaction.emoji.name || !allowedEmojis.includes(reaction.emoji.name)) {
            return;
        }

        // Obtener el servidor (guild) del mensaje
        const guild = reaction.message.guild;
        if (!guild) return;

        // Buscar el rol con el nombre "NombreTorneo: Equipo reaction.emoji.name"
        const roleName = `${torneoNombre}: Equipo ${reaction.emoji.name}`;
        const role = guild.roles.cache.find((r) => r.name === roleName);

        if (!role) {
            return;
        }

        // Obtener el miembro del usuario que quitó la reacción
        const member = await guild.members.fetch(user.id);
        if (!member) {
            return;
        }

        // Quitar el rol del miembro
        try {
            await member.roles.remove(role);
        } catch (error) {
            console.error(`Error al quitar el rol "${roleName}" al usuario ${user.tag}:`, error);
        }
    },
};

export default reactionEvent;
