import { User } from "@/auth/models/User.js";
import { Connection } from "mongoose";
import { MyHydratedDocument } from "@/shared/types/database/mongoose/mongoose.js";
import IUserRepository, { CreateParams, UserPersistent } from "@/targetsService/persistence/IUserRepository.js";
import { UserModelType, userSchema } from "@/targetsService/persistence/mongoose/models/User.js";

export default class UserRepository implements IUserRepository {
	static #model: UserModelType | undefined;
	private dbConnection: Connection;
	public static readonly modelName = "User";
	public static readonly collectionName = "users";

	constructor(dbConnection: Connection) {
		this.dbConnection = dbConnection;
	}

	private get _model(): UserModelType {
		if (!UserRepository.#model) {
			UserRepository.#model = this.dbConnection.model<User, UserModelType>(UserRepository.modelName, userSchema, UserRepository.collectionName);
		}

		return UserRepository.#model;
	}

	public async get(customId: string): Promise<UserPersistent | null> {
		return await this._model.findOne(<Pick<User, "customId">>{ customId: customId }).exec() as MyHydratedDocument<User>;
	}

	// TODO: What happens if this method fails?
	public async create(createParams: CreateParams): Promise<UserPersistent> {
		const newUser = new this._model(<User>{
			customId: createParams.customId
		});

		return await newUser.save();
	}
}
