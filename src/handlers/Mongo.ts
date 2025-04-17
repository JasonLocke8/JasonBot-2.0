import mongoose from "mongoose";
import { color } from "../functions";

mongoose.set("strictQuery", true);

module.exports = () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) return console.log(color("text", `🍃 Mongo URI no funciona ${color("error", ":(")}`));
    mongoose.connect(`${MONGO_URI}/${process.env.MONGO_DATABASE_NAME}`)
        .then(() => console.log(color("text", `🍃 La conexión con MongoDB es ${color("variable", "correcta!")}`)))
        .catch(() => console.log(color("text", `🍃 La conexión con MongoDB es ${color("error", "fallida.")}`)));
};