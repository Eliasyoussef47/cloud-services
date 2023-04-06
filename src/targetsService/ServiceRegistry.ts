import IUserRepository from "@/shared/persistence/IUserRepository.js";
import ITargetRepository from "@/targetsService/persistence/ITargetRepository.js";
import { TargetsServiceMessageBroker } from "@/targetsService/MessageBroker/MessageBroker.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";

export interface Services {
	targetRepository: ITargetRepository;
	userRepository: IUserRepository;
	messageBroker: MessageBroker;
	targetsServiceMessageBroker: TargetsServiceMessageBroker;
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;
	public messageBroker: MessageBroker;
	public targetsServiceMessageBroker: TargetsServiceMessageBroker;
	private readonly _targetRepository: ITargetRepository;
	private readonly _userRepository: IUserRepository;

	constructor(services: Services) {
		this._targetRepository = services.targetRepository;
		this._userRepository = services.userRepository;
		this.messageBroker = services.messageBroker;
		this.targetsServiceMessageBroker = services.targetsServiceMessageBroker;
	}

	public get targetRepository(): ITargetRepository {
		return this._targetRepository;
	}

	public get userRepository(): IUserRepository {
		return this._userRepository;
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
