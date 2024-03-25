import { Environment } from "@/shared/operation/Environment.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { ImageRecognitionServiceMessageBroker } from "@/imageRecognitionService/MessageBroker/ImageRecognitionServiceMessageBroker.js";
import ServicesRegistry, { Services } from "@/imageRecognitionService/ServicesRegistry.js";

async function setupMessageBroker() {
	const messageBroker = new MessageBroker();
	// TODO: Check first if the connection and channel was established.
	await messageBroker.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBroker.createChannel();
	messageBroker.channel?.prefetch(1);

	const imageRecognitionServiceMessageBroker = new ImageRecognitionServiceMessageBroker(messageBroker);
	await messageBroker.setup();
	await imageRecognitionServiceMessageBroker.consume();
	return { messageBroker, imageRecognitionServiceMessageBroker };
}

export async function setupDependencies() {
	const { messageBroker, imageRecognitionServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		messageBroker: messageBroker,
		imageRecognitionServiceMessageBroker: imageRecognitionServiceMessageBroker
	};

	ServicesRegistry.setupInitial(services);
}
