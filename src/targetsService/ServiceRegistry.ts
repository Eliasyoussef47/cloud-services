import IUserRepository from "@/targetsService/persistence/IUserRepository.js";
import ITargetRepository from "@/targetsService/persistence/ITargetRepository.js";
import { IMessageBrokerUser } from "@/shared/MessageBroker/MessageBroker.js";
import { TargetsServiceMessageBroker } from "@/shared/MessageBroker/implementations.js";

export interface Services {
	targetRepository: ITargetRepository;
	userRepository: IUserRepository;
	messageBrokerUser: IMessageBrokerUser;
	targetsServiceMessageBroker: TargetsServiceMessageBroker;
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;

	private readonly _targetRepository: ITargetRepository;
	private readonly _userRepository: IUserRepository;

	public messageBrokerUser: IMessageBrokerUser;
	public targetsServiceMessageBroker: TargetsServiceMessageBroker;

	constructor(services: Services) {
		this._targetRepository = services.targetRepository;
		this._userRepository = services.userRepository;
		this.messageBrokerUser = services.messageBrokerUser;
		this.targetsServiceMessageBroker = services.authServiceMessageBroker;
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

	public get targetRepository(): ITargetRepository {
		return this._targetRepository;
	}

	public get userRepository(): IUserRepository {
		return this._userRepository;
	}

}
