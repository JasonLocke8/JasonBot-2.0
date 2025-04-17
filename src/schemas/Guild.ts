import { Schema, model } from "mongoose";
import { IGuild } from "../types";

const GuildSchema = new Schema<IGuild>({
    guildID: {required:true, type: String},
    options: {}
})

const GuildModel = model("guild", GuildSchema)

export default GuildModel