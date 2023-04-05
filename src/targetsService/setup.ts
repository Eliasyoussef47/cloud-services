import Database from "@/shared/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import ServicesRegistry, { Services } from "@/targetsService/ServiceRegistry.js";
import TargetRepository from "@/targetsService/persistence/mongoose/TargetRepository.js";
import UserRepository from "@/targetsService/persistence/mongoose/UserRepository.js";
import { MessageBrokerUser } from "@/shared/MessageBroker/helperClasses.js";
import { TargetsServiceMessageBroker } from "@/targetsService/MessageBroker/MessageBroker.js";

async function setupMessageBroker() {
	const messageBrokerUser = new MessageBrokerUser();
	// TODO: Check first if the connection and channel was established.
	await messageBrokerUser.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBrokerUser.createChannel();

	const targetsServiceMessageBroker = new TargetsServiceMessageBroker(messageBrokerUser);
	await targetsServiceMessageBroker.assertExchanges();
	await targetsServiceMessageBroker.setupQueues();
	void targetsServiceMessageBroker.consume();
	return { messageBrokerUser, targetsServiceMessageBroker };
}

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.TARGETS_DATABASE_PATH);
	const dbConnection = Database.getInstance().connection;

	const { messageBrokerUser, targetsServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		targetRepository: new TargetRepository(dbConnection),
		userRepository: new UserRepository(dbConnection),
		messageBrokerUser,
		targetsServiceMessageBroker
	}
	ServicesRegistry.setupInitial(services);
}
