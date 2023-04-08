import { DefaultSchemaOptions, type Model, Schema, SchemaTypes } from "mongoose";
import { MongooseBase } from "@/shared/types/database/mongoose/mongoose.js";
import { Target } from "@/submissionsService/models/Target.js";
import UserRepository from "@/shared/persistence/mongoose/UserRepository.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";

type MongooseTarget = MongooseBase & Target;
export type TargetModelType = Model<MongooseTarget>;

export const targetSchema = new Schema<MongooseTarget, TargetModelType, Target, TargetModelType, Target, TargetModelType, DefaultSchemaOptions, Target, Target>({
	customId: { type: SchemaTypes.String, required: true },
	userId: { type: SchemaTypes.String, required: true, ref: UserRepository.modelName }
});
targetSchema.set("toObject", { versionKey: false, useProjection: true });
targetSchema.pre<Target>(["deleteOne", "deleteMany", "remove"], { document : true , query : false } , async function () {
	try {
		await ServicesRegistry.getInstance().submissionRepository.deleteMany({ targetId: this.customId });
	} catch (e) {
		console.error("Error while deleting a submission.", e);
	}
});
