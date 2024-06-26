import IUserRepository from "@/auth/persistence/IUserRepository.js";
import { AuthServiceMessageBroker } from "@/shared/MessageBroker/implementations.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { User } from "@/auth/models/User.js";

export interface Services {
	userRepository: IUserRepository;
	messageBroker: MessageBroker;
	authServiceMessageBroker: AuthServiceMessageBroker;
	user: User | undefined
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;
	public messageBroker: MessageBroker;
	public user: User | undefined;
	private readonly _userRepository: IUserRepository;
	private readonly _authServiceMessageBroker: AuthServiceMessageBroker;

	constructor(services: Services) {
		this._userRepository = services.userRepository;
		this.messageBroker = services.messageBroker;
		this._authServiceMessageBroker = services.authServiceMessageBroker;
		this.user = services.user;
	}

	public get userRepository(): IUserRepository {
		return this._userRepository;
	}

	public get authServiceMessageBroker(): AuthServiceMessageBroker {
		return this._authServiceMessageBroker;
	}

	public static getInstance(): ServicesRegistry {
		return this.#instance!;
	}

	public static setInstance(value: ServicesRegistry) {
		this.#instance = value;
	}

	public static setupInitial(services: Services) {
		ServicesRegistry.setInstance(new ServicesRegistry(services));
	}
}
