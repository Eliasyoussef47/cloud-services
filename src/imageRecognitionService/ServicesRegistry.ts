import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { ImageRecognitionServiceMessageBroker } from "@/imageRecognitionService/MessageBroker/ImageRecognitionServiceMessageBroker.js";

export interface Services {
	messageBroker: MessageBroker;
	imageRecognitionServiceMessageBroker: ImageRecognitionServiceMessageBroker;
}

export default class ServicesRegistry implements Services {
	static #instance: ServicesRegistry;
	public messageBroker: MessageBroker;
	public imageRecognitionServiceMessageBroker: ImageRecognitionServiceMessageBroker;

	constructor(services: Services) {
		this.messageBroker = services.messageBroker;
		this.imageRecognitionServiceMessageBroker = services.imageRecognitionServiceMessageBroker;
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
