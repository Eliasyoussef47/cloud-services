import ServicesRegistry, { Services } from "@/auth/ServicesRegistry.js";
import UserRepository from "@/auth/persistence/mongoose/UserRepository.js";
import Database from "@/shared/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import { TargetsServiceMessageBroker } from "@/shared/MessageBroker/implementations.js";
import { MessageBrokerUser } from "@/shared/MessageBroker/helperClasses.js";

async function setupMessageBroker() {
	const messageBrokerUser = new MessageBrokerUser();
	await messageBrokerUser.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBrokerUser.createChannel();

	const targetsServiceMessageBroker = new TargetsServiceMessageBroker(messageBrokerUser);
	await targetsServiceMessageBroker.assertExchanges();
	await targetsServiceMessageBroker.assertQueues();
	return { messageBrokerUser, targetsServiceMessageBroker };
}

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.AUTH_DATABASE_PATH);
	const { messageBrokerUser, targetsServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		userRepository: new UserRepository(Database.getInstance().connection),
		messageBrokerUser: messageBrokerUser,
		targetsServiceMessageBroker: targetsServiceMessageBroker
	}
	ServicesRegistry.setupInitial(services);
}
