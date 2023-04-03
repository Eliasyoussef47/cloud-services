import IUserRepository from "@/targetsService/persistence/IUserRepository.js";
import ITargetRepository from "@/targetsService/persistence/ITargetRepository.js";

export interface Services {
	targetRepository: ITargetRepository;
	userRepository: IUserRepository;
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;

	private readonly _targetRepository: ITargetRepository;
	private readonly _userRepository: IUserRepository;

	constructor(services: Services) {
		this._targetRepository = services.targetRepository;
		this._userRepository = services.userRepository;
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
