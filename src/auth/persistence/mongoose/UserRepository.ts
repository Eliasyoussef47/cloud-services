import IUserRepository, { CreateParams, UserPersistent } from "@/auth/persistence/IUserRepository.js";
import { User } from "@/auth/models/User.js";
import { UserModelType, userSchema } from "@/auth/persistence/mongoose/models/User.js";
import { Connection } from "mongoose";
import { MyHydratedDocument } from "@/shared/types/database/mongoose/mongoose.js";
import { DatabaseError } from "@/shared/types/errors/ServiceError.js";

export default class UserRepository implements IUserRepository {
	static #model: UserModelType | undefined;
	public readonly modelName = "User";
	public readonly collectionName = "users";
	private dbConnection: Connection | undefined;

	constructor(dbConnection: Connection | undefined) {
		this.dbConnection = dbConnection;
	}

	private get _model(): UserModelType | undefined {
		if (!UserRepository.#model) {
			UserRepository.#model = this.dbConnection?.model<User, UserModelType>(this.modelName, userSchema, this.collectionName);
		}

		return UserRepository.#model;
	}

	// TODO: What happens if this method fails?
	public async create(createParams: CreateParams): Promise<UserPersistent> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		const newUser = new model(<User> {
			customId: createParams.customId,
			opaqueId: createParams.opaqueId,
			username: createParams.username,
			password: createParams.password
		});

		return await newUser.save();
	}

	public async get(customId: string): Promise<UserPersistent | null> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		return await model.findOne(<Pick<User, "customId">> { customId: customId }).exec() as MyHydratedDocument<User>;
	}

	public async getByOpaqueId(opaqueId: string): Promise<UserPersistent | null> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		return await model.findOne(<Pick<User, "opaqueId">> { opaqueId: opaqueId }).exec() as MyHydratedDocument<User>;
	}

	public async getByUsername(username: string): Promise<UserPersistent | null> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		// TODO: Check the content of toObject.
		return await model.findOne(<Pick<User, "username">> { username: username }).exec() as MyHydratedDocument<User>;
	}
}
