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
        if (reaction.message.embeds.length > 0 && reaction.message.embeds[0].title === "Torneo!") {
            // Obtener el servidor (guild) del mensaje
            const guild = reaction.message.guild;
            if (!guild) return;

            // Buscar el rol con el nombre "Equipo reaction.emoji.name"
            const roleName = `Equipo ${reaction.emoji.name}`;
            const role = guild.roles.cache.find((r) => r.name === roleName);

            if (!role) return;

            // Obtener el miembro del usuario que quitó la reacción
            const member = await guild.members.fetch(user.id);
            if (!member) return;

            // Quitar el rol del miembro
            try {
                await member.roles.remove(role);
            } catch (error) {
                // Manejo de errores
            }
        }
    },
};

export default reactionEvent;
