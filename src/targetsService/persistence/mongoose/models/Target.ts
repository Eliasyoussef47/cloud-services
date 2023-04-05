import { MongooseBase, MongooseWithTimestamps } from "@/shared/types/database/mongoose/mongoose.js";
import { Target } from "@/targetsService/models/Target.js";
import { DefaultSchemaOptions, type Model, Schema, SchemaTypes } from "mongoose";
import UserRepository from "@/targetsService/persistence/mongoose/UserRepository.js";

type MongooseTarget = MongooseBase & MongooseWithTimestamps & Target;
export type TargetModelType = Model<MongooseTarget>;

export const targetSchema = new Schema<MongooseTarget, TargetModelType, Target, TargetModelType, Target, TargetModelType, DefaultSchemaOptions, MongooseTarget, Target>({
	// TODO: Set index on customId.
	customId: { type: SchemaTypes.String, required: true },
	userId: { type: SchemaTypes.String, required: true, ref: UserRepository.modelName },
	source: { type: SchemaTypes.String, required: true },
	base64Encoded: { type: SchemaTypes.String, required: true },
	locationName: { type: SchemaTypes.String, required: true },
	externalUploadId: { type: SchemaTypes.String, default: null },

}, { timestamps: true });
targetSchema.set("toObject", { versionKey: false, useProjection: true });
