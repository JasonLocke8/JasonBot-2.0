import { Events, MessageReaction, User } from "discord.js";
import TorneoSchema from "../schemas/Torneo";

interface ReactionEvent {
  name: typeof Events.MessageReactionAdd;
  execute: (reaction: MessageReaction, user: User) => Promise<void>;
}

const allowedEmojis = [
  "🐵",
  "🐶",
  "🐺",
  "🦝",
  "🐱",
  "🦁",
  "🐯",
  "🐴",
  "🦄",
  "🐮",
  "🐷",
  "🐭",
  "🐻",
  "🐨",
  "🐥",
  "🐧",
  "🐸",
  "🐬",
  "🐌",
  "🐝",
];

const reactionEvent: ReactionEvent = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;

    const embed = reaction.message.embeds[0];
    if (!embed || embed.title !== "Torneo!") {
      return;
    }

    const torneoNombre =
      embed.description?.match(/El torneo \*\*(.+?)\*\*/)?.[1] || null;
    if (!torneoNombre) {
      return;
    }

    if (!reaction.emoji.name || !allowedEmojis.includes(reaction.emoji.name)) {
      await reaction.users.remove(user.id);
      return;
    }

    const botReaction = reaction.message.reactions.cache.get(
      reaction.emoji.name
    );
    if (!botReaction || !botReaction.me) {
      await reaction.users.remove(user.id);
      return;
    }

    const allReactions = reaction.message.reactions.cache;
    for (const [emoji, reactionInstance] of allReactions) {
      if (
        reactionInstance.users.cache.has(user.id) &&
        emoji !== reaction.emoji.name
      ) {
        await reaction.users.remove(user.id);
        return;
      }
    }

    const guild = reaction.message.guild;
    if (!guild) return;

    const member = await guild.members.fetch(user.id);
    if (!member) return;

    const torneo = await TorneoSchema.findOne({ name: torneoNombre });
    if (!torneo) {
      return;
    }

    const torneoRoles = guild.roles.cache.filter((role) =>
      role.name.startsWith(`${torneoNombre}: Equipo`)
    );
    const existingRole = member.roles.cache.find((role) =>
      torneoRoles.has(role.id)
    );

    if (existingRole) {
      await reaction.users.remove(user.id);
      return;
    }

    const roleName = `${torneoNombre}: Equipo ${reaction.emoji.name}`;
    let role = guild.roles.cache.find((r) => r.name === roleName);

    if (!role) {
      try {
        role = await guild.roles.create({
          name: roleName,
          color: "Random",
          reason: `Rol creado automáticamente para el torneo ${torneoNombre} y la reacción ${reaction.emoji.name}`,
        });
      } catch (error) {
        return;
      }
    }

    try {
      await member.roles.add(role);
    } catch (error) {
      return;
    }
  },
};

export default reactionEvent;