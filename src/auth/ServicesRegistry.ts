import IUserRepository from "@/auth/persistence/IUserRepository.js";

export interface Services {
	userRepository: IUserRepository;
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;

	private readonly _userRepository: IUserRepository;

	constructor(services: Services) {
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

	public get userRepository(): IUserRepository {
		return this._userRepository;
	}
}
