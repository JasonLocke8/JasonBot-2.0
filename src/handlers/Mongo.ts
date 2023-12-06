import mongoose from "mongoose";
import { color } from "../functions";

module.exports = () => {
    const MONGO_URI = process.env.MONGO_URI
    if (!MONGO_URI) return console.log(color("text",`🍃 Mongo URI no funciona ${color("error", ":(")}`))
    mongoose.connect(`${MONGO_URI}/${process.env.MONGO_DATABASE_NAME}`)
    .then(() => console.log(color("text",`🍃 MongoDB connection has been ${color("variable", "established.")}`)))
    .catch(() => console.log(color("text",`🍃 MongoDB connection has been ${color("error", "failed.")}`)))
}