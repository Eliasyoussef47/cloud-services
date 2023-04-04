import ServicesRegistry, { Services } from "@/auth/ServicesRegistry.js";
import UserRepository from "@/auth/persistence/mongoose/UserRepository.js";
import Database from "@/shared/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import { AuthServiceMessageBroker, TargetsServiceMessageBroker } from "@/shared/MessageBroker/implementations.js";
import { MessageBrokerUser } from "@/shared/MessageBroker/helperClasses.js";

async function setupMessageBroker() {
	const messageBrokerUser = new MessageBrokerUser();
	// TODO: Check first if the connection and channel was established.
	await messageBrokerUser.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBrokerUser.createChannel();

	const targetsServiceMessageBroker = new AuthServiceMessageBroker(messageBrokerUser);
	await targetsServiceMessageBroker.assertExchanges();
	return { messageBrokerUser, targetsServiceMessageBroker };
}

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.AUTH_DATABASE_PATH);
	const { messageBrokerUser, targetsServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		userRepository: new UserRepository(Database.getInstance().connection),
		messageBrokerUser: messageBrokerUser,
		authServiceMessageBroker: targetsServiceMessageBroker
	}
	ServicesRegistry.setupInitial(services);
}
