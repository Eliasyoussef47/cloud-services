import { HydratedDocument as MongooseHydratedDocument, Types } from "mongoose";

export type MongooseBase<T = Types.ObjectId> = {
	/**
	 * This documents _id.
	 */
	_id?: T;

	/**
	 * This documents __v.
	 */
	__v?: any;
}

export type MongooseWithTimestamps = {
	createdAt: Date;
	updatedAt: Date;
}

export type MyHydratedDocument<DocType,
	TOverrides = {},
	TQueryHelpers = {}>
	= Omit<MongooseHydratedDocument<DocType, TOverrides, TQueryHelpers>, "__v">;
