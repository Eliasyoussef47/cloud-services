import { DefaultSchemaOptions, type Model, Schema, SchemaTypes } from "mongoose";
import { User } from "@/auth/models/User.js";
import { MongooseBase } from "@/shared/types/database/mongoose/mongoose.js";

type MongooseUser = MongooseBase & User;
export type UserModelType = Model<MongooseUser>;

export const userSchema = new Schema<MongooseUser, UserModelType, User, UserModelType, User, UserModelType, DefaultSchemaOptions, User, User>({
	// TODO: Set index on customId.
	customId: { type: SchemaTypes.String, required: true },
	opaqueId: { type: SchemaTypes.String, required: true },
	username: { type: SchemaTypes.String, required: true, unique: true },
	password: { type: SchemaTypes.String, required: true },
	role: { type: SchemaTypes.String, required: true, default: "user" }
});
userSchema.set("toObject", { versionKey: false, useProjection: true });
