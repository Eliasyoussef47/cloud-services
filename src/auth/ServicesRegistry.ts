import IUserRepository from "@/auth/persistence/IUserRepository.js";
import { TargetsServiceMessageBroker } from "@/shared/MessageBroker/implementations.js";
import { IMessageBrokerUser } from "@/shared/MessageBroker/MessageBroker.js";

export interface Services {
	userRepository: IUserRepository;
	messageBrokerUser: IMessageBrokerUser;
	targetsServiceMessageBroker: TargetsServiceMessageBroker;
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;

	private readonly _userRepository: IUserRepository;
	private readonly _targetsServiceMessageBroker: TargetsServiceMessageBroker;

	public messageBrokerUser: IMessageBrokerUser;

	constructor(services: Services) {
		this._userRepository = services.userRepository;
		this.messageBrokerUser = services.messageBrokerUser;
		this._targetsServiceMessageBroker = services.targetsServiceMessageBroker;
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

	public get userRepository(): IUserRepository {
		return this._userRepository;
	}

	public get targetsServiceMessageBroker(): TargetsServiceMessageBroker {
		return this._targetsServiceMessageBroker;
	}
}
