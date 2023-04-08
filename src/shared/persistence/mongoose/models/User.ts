import { DefaultSchemaOptions, type Model, Schema, SchemaTypes } from "mongoose";
import { MongooseBase } from "@/shared/types/database/mongoose/mongoose.js";
import { User } from "@/shared/models/User.js";
import { IUserMethods } from "@/auth/persistence/mongoose/models/User.js";

type MongooseUser = MongooseBase & User;
export type UserModelType = Model<MongooseUser, {}, IUserMethods>;

export const userSchema = new Schema<MongooseUser, UserModelType, User, UserModelType, User, UserModelType, DefaultSchemaOptions, User, User>({
	// TODO: Set index on customId.
	customId: { type: SchemaTypes.String, required: true }
});
userSchema.set("toObject", { versionKey: false, useProjection: true });
