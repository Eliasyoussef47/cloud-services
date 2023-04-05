import ServicesRegistry, { Services } from "@/auth/ServicesRegistry.js";
import UserRepository from "@/auth/persistence/mongoose/UserRepository.js";
import Database from "@/shared/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import { AuthServiceMessageBroker } from "@/shared/MessageBroker/implementations.js";
import { MessageBroker, MessageBrokerUser } from "@/shared/MessageBroker/helperClasses.js";
import { TargetsServiceMessageBroker } from "@/targetsService/MessageBroker/MessageBroker.js";

async function setupMessageBroker() {
	const messageBroker = new MessageBroker();
	// TODO: Check first if the connection and channel was established.
	await messageBroker.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBroker.createChannel();

	const authServiceMessageBroker = new AuthServiceMessageBroker(messageBroker);
	await messageBroker.assertExchanges();
	await messageBroker.bindExchanges();
	await messageBroker.setupQueues();
	return { messageBroker, authServiceMessageBroker };
}

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.AUTH_DATABASE_PATH);
	const { messageBroker, authServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		userRepository: new UserRepository(Database.getInstance().connection),
		messageBroker: messageBroker,
		authServiceMessageBroker: authServiceMessageBroker
	}

	ServicesRegistry.setupInitial(services);
}
