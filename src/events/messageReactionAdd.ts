import { Events, MessageReaction, User } from "discord.js";

interface ReactionEvent {
    name: typeof Events.MessageReactionAdd;
    execute: (reaction: MessageReaction, user: User) => Promise<void>;
}

// Lista de emojis permitidos (los que el bot agregó)
const allowedEmojis = [
    "🐵", "🐶", "🐺", "🦝", "🐱", "🦁", "🐯", "🐴", "🦄", "🐮",
    "🐷", "🐭", "🐻", "🐨", "🐥", "🐧", "🐸", "🐬", "🐌", "🐝"
];

const reactionEvent: ReactionEvent = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        // Ignorar reacciones del propio bot
        if (user.bot) return;

        // Verificar si el mensaje tiene un embed con el título "Torneo!"
        const embed = reaction.message.embeds[0];
        if (!embed || embed.title !== "Torneo!") {
            return;
        }

        // Verificar si el emoji está en la lista de emojis permitidos
        if (!reaction.emoji.name || !allowedEmojis.includes(reaction.emoji.name)) {
            await reaction.users.remove(user.id); // Eliminar la reacción no permitida
            return;
        }

        // Verificar si el emoji es uno de los que el bot reaccionó
        const botReaction = reaction.message.reactions.cache.get(reaction.emoji.name);
        if (!botReaction || !botReaction.me) {
            await reaction.users.remove(user.id); // Eliminar la reacción no válida
            return;
        }

        // Verificar si el usuario ya reaccionó con otro emoji en el mensaje
        const allReactions = reaction.message.reactions.cache;
        for (const [emoji, reactionInstance] of allReactions) {
            if (reactionInstance.users.cache.has(user.id) && emoji !== reaction.emoji.name) {
                await reaction.users.remove(user.id); // Eliminar la nueva reacción
                return;
            }
        }

        // Obtener el servidor (guild) del mensaje
        const guild = reaction.message.guild;
        if (!guild) return;

        // Obtener el miembro del usuario que reaccionó
        const member = await guild.members.fetch(user.id);
        if (!member) return;

        // Buscar todos los roles relacionados con el torneo
        const torneoRoles = guild.roles.cache.filter((role) =>
            role.name.startsWith("Equipo")
        );

        // Verificar si el usuario ya tiene un rol del torneo
        const existingRole = member.roles.cache.find((role) =>
            torneoRoles.has(role.id)
        );

        if (existingRole) {
            await reaction.users.remove(user.id);
            return;
        }

        // Buscar el rol con el nombre "Equipo reaction.emoji.name"
        const roleName = `Equipo ${reaction.emoji.name}`;
        let role = guild.roles.cache.find((r) => r.name === roleName);

        // Si el rol no existe, crearlo
        if (!role) {
            try {
                role = await guild.roles.create({
                    name: roleName,
                    color: "Random",
                    reason: `Rol creado automáticamente para la reacción ${reaction.emoji.name}`,
                });
            } catch (error) {
                return;
            }
        }

        // Asignar el rol al miembro
        try {
            await member.roles.add(role);
        } catch (error) {
            // Manejo de errores al asignar el rol
        }
    },
};

export default reactionEvent;
