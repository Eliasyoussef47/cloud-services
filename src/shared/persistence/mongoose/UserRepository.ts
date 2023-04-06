import { User } from "@/auth/models/User.js";
import { Connection } from "mongoose";
import { MyHydratedDocument } from "@/shared/types/database/mongoose/mongoose.js";
import IUserRepository, { CreateParams, UserPersistent } from "@/shared/persistence/IUserRepository.js";
import { UserModelType, userSchema } from "@/shared/persistence/mongoose/models/User.js";
import { DatabaseError } from "@/shared/types/errors/ServiceError.js";

export default class UserRepository implements IUserRepository {
	public static readonly modelName = "User";
	public static readonly collectionName = "users";
	static #model: UserModelType | undefined;
	private dbConnection: Connection | undefined;

	constructor(dbConnection: Connection | undefined) {
		this.dbConnection = dbConnection;
	}

	private get _model(): UserModelType | undefined {
		if (!UserRepository.#model) {
			UserRepository.#model = this.dbConnection?.model<User, UserModelType>(UserRepository.modelName, userSchema, UserRepository.collectionName);
		}

		return UserRepository.#model;
	}

	public async get(customId: string): Promise<UserPersistent | null> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		return await model.findOne(<Pick<User, "customId">> { customId: customId }).exec() as MyHydratedDocument<User>;
	}

	// TODO: What happens if this method fails?
	public async create(createParams: CreateParams): Promise<UserPersistent> {
		const model = this._model;
		if (!model) {
			throw new DatabaseError("No database connection");
		}

		const newUser = new model(createParams);

		return await newUser.save();
	}
}
