import { DefaultSchemaOptions, type Model, Schema, SchemaTypes } from "mongoose";
import { MongooseBase } from "@/shared/types/database/mongoose/mongoose.js";
import { Target } from "@/submissionsService/models/Target.js";

type MongooseTarget = MongooseBase & Target;
export type TargetModelType = Model<MongooseTarget>;

export const targetSchema = new Schema<MongooseTarget, TargetModelType, Target, TargetModelType, Target, TargetModelType, DefaultSchemaOptions, Target, Target>({
	customId: { type: SchemaTypes.String, required: true }
});
targetSchema.set("toObject", { versionKey: false, useProjection: true });
