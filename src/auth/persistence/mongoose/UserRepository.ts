import IUserRepository, { CreateParams, UserPersistent } from "@/auth/persistence/IUserRepository.js";
import { User } from "@/auth/models/User.js";
import { UserModelType, userSchema } from "@/auth/persistence/mongoose/models/User.js";
import { Connection } from "mongoose";
import { MyHydratedDocument } from "@/shared/types/database/mongoose/mongoose.js";

export default class UserRepository implements IUserRepository {
	static #model: UserModelType | undefined;
	private dbConnection: Connection;
	public readonly modelName = "User";
	public readonly collectionName = "users";

	constructor(dbConnection: Connection) {
		this.dbConnection = dbConnection;
	}

	private get _model(): UserModelType {
		if (!UserRepository.#model) {
			UserRepository.#model = this.dbConnection.model<User, UserModelType>(this.modelName, userSchema, this.collectionName);
		}

		return UserRepository.#model;
	}

	public async create(createParams: CreateParams): Promise<UserPersistent> {
		const newUser = new this._model({
			customId: createParams.customId,
			username: createParams.username,
			password: createParams.password
		});

		return await newUser.save();
	}

	public async get(customId: string): Promise<UserPersistent | null> {
		return await this._model.findOne({ customId: customId }).exec() as MyHydratedDocument<User>;
	}

	public async getByUsername(username: string): Promise<UserPersistent | null> {
		// TODO: Check the content of toObject.
		return await this._model.findOne({ username: username }).exec() as MyHydratedDocument<User>;
	}
}
