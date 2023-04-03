import { DefaultSchemaOptions, type Model, Schema, SchemaTypes } from "mongoose";
import { MongooseBase } from "@/shared/types/database/mongoose/mongoose.js";
import { User } from "@/targetsService/models/User.js";

type MongooseUser = MongooseBase & User;
export type UserModelType = Model<MongooseUser>;

export const userSchema = new Schema<MongooseUser, UserModelType, User, UserModelType, User, UserModelType, DefaultSchemaOptions, User, User>({
	// TODO: Set index on customId.
	customId: { type: SchemaTypes.String, required: true }
});
userSchema.set("toObject", { versionKey: false, useProjection: true });
