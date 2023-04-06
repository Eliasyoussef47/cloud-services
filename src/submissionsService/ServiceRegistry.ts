import ITargetRepository from "@/submissionsService/persistence/ITargetRepository.js";
import IUserRepository from "@/shared/persistence/IUserRepository.js";
import ISubmissionRepository from "@/submissionsService/persistence/ISubmissionRepository.js";
import { SubmissionsServiceMessageBroker } from "@/submissionsService/MessageBroker/SubmissionsServiceMessageBroker.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";

export interface Services {
	targetRepository: ITargetRepository;
	userRepository: IUserRepository;
	submissionRepository: ISubmissionRepository;
	messageBroker: MessageBroker;
	submissionsServiceMessageBroker: SubmissionsServiceMessageBroker;
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;
	public messageBroker: MessageBroker;
	public submissionsServiceMessageBroker: SubmissionsServiceMessageBroker;
	readonly targetRepository: ITargetRepository;
	readonly userRepository: IUserRepository;
	readonly submissionRepository: ISubmissionRepository;

	constructor(services: Services) {
		this.targetRepository = services.targetRepository;
		this.userRepository = services.userRepository;
		this.messageBroker = services.messageBroker;
		this.submissionsServiceMessageBroker = services.submissionsServiceMessageBroker;
		this.submissionRepository = services.submissionRepository;
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
