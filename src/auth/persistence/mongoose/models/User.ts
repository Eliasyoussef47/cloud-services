import { type Model, Schema, SchemaTypes } from "mongoose";
import { User } from "@/auth/models/User.js";

export type UserModelType = Model<User>;

export const userSchema = new Schema<User, UserModelType>({
	// TODO: Set index on customId.
	customId: {type: SchemaTypes.String, required: true},
	username: {type: SchemaTypes.String, required: true},
	password: {type: SchemaTypes.String, required: true},
});
