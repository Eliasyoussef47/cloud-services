import ServicesRegistry, { Services } from "@/auth/ServicesRegistry.js";
import UserRepository from "@/auth/persistence/mongoose/UserRepository.js";
import Database from "@/shared/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import { AuthServiceMessageBroker } from "@/shared/MessageBroker/implementations.js";
import { MessageBrokerUser } from "@/shared/MessageBroker/helperClasses.js";
import { TargetsServiceMessageBroker } from "@/targetsService/MessageBroker/MessageBroker.js";

async function setupMessageBroker() {
	const messageBrokerUser = new MessageBrokerUser();
	// TODO: Check first if the connection and channel was established.
	await messageBrokerUser.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBrokerUser.createChannel();

	const authServiceMessageBroker = new AuthServiceMessageBroker(messageBrokerUser);
	await authServiceMessageBroker.assertExchanges();
	return { messageBrokerUser, authServiceMessageBroker };
}

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.AUTH_DATABASE_PATH);
	const { messageBrokerUser, authServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		userRepository: new UserRepository(Database.getInstance().connection),
		messageBrokerUser: messageBrokerUser,
		authServiceMessageBroker: authServiceMessageBroker
	}

	ServicesRegistry.setupInitial(services);
}
