import { DefaultSchemaOptions, type Model, Schema, SchemaTypes } from "mongoose";
import { User } from "@/auth/models/User.js";
import { MongooseBase } from "@/shared/types/database/mongoose/mongoose.js";

type MongooseUser = MongooseBase & User;
export type UserModelType = Model<MongooseUser>;

export const userSchema = new Schema<MongooseUser, UserModelType, User, UserModelType, User, UserModelType, DefaultSchemaOptions, User, User>({
	_id: { type: SchemaTypes.ObjectId, required: true },
	// TODO: Set index on customId.
	customId: { type: SchemaTypes.String, required: true },
	tempId: { type: SchemaTypes.String, required: true },
	username: { type: SchemaTypes.String, required: true },
	password: { type: SchemaTypes.String, required: true },
});
userSchema.set("toObject", { versionKey: false, useProjection: true })
