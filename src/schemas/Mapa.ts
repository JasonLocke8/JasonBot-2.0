import mongoose, { Schema, Document } from "mongoose";

export interface IMapa extends Document {
  name: string;
  value: string;
  composition: string;
  image: string;
  controlador: string;
  duelista: string;
  centinela: string;
  iniciador: string;
}

const MapaSchema = new Schema<IMapa>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  composition: { type: String, required: true },
  image: { type: String, required: true },
  controlador: { type: String, required: true },
  duelista: { type: String, required: true },
  centinela: { type: String, required: true },
  iniciador: { type: String, required: true },
});

export default mongoose.model<IMapa>("Mapa", MapaSchema);