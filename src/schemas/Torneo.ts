import mongoose, { Schema, Document } from "mongoose";

export interface ITorneo extends Document {
    nombre: string;
    juego: string;
    cantidadEquipos: number;
    tipo: string;
    mensajeId: string;
    canalId: string;
}

const TorneoSchema = new Schema<ITorneo>({
    nombre: { type: String, required: true },
    juego: { type: String, required: true },
    cantidadEquipos: { type: Number, required: true },
    mensajeId: { type: String, required: true },
    tipo: { type: String, required: true },
    canalId: { type: String, required: true },
});

export default mongoose.model<ITorneo>("Torneo", TorneoSchema);