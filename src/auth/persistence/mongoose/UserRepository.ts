import IUserRepository, { CreateParams } from "@/auth/persistence/IUserRepository.js";
import { User } from "@/auth/models/User.js";
import NotImplementedError from "@/shared/types/errors/NotImplementedError.js";
import { UserModelType, userSchema } from "@/auth/persistence/mongoose/models/User.js";
import Database from "@/auth/persistence/mongoose/Database.js";
import { HydratedDocument } from "mongoose";

export default class UserRepository implements IUserRepository {
	static #model: UserModelType | undefined;

	private get _model(): UserModelType {
		if (!UserRepository.#model) {
			UserRepository.#model = Database.getInstance().connection.model<User, UserModelType>("BlogPost", userSchema, "blogPosts");
		}

		return UserRepository.#model;
	}

	public async create(createParams: CreateParams): Promise<User> {
		const newUser = new this._model({
			customId: createParams.customId,
			username: createParams.username,
			password: createParams.password
		});

		const savedUser: HydratedDocument<User> = await newUser.save();
		return savedUser.toObject();
	}

	public async get(customId: string): Promise<User | null> {
		const found: HydratedDocument<User> | null = await this._model.findOne({customId: customId}).exec();
		return found?.toObject() ?? null;
	}

	public async getByUsername(username: string): Promise<User | null> {
		const found: HydratedDocument<User> | null = await this._model.findOne({username: username}).exec();
		return found?.toObject() ?? null;
	}
}
