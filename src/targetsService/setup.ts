import Database from "@/shared/persistence/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import ServicesRegistry, { Services } from "@/targetsService/ServiceRegistry.js";
import TargetRepository from "@/targetsService/persistence/mongoose/TargetRepository.js";
import UserRepository from "@/shared/persistence/mongoose/UserRepository.js";
import { TargetsServiceMessageBroker } from "@/targetsService/MessageBroker/MessageBroker.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";

async function setupMessageBroker() {
	const messageBroker = new MessageBroker();
	// TODO: Check first if the connection and channel was established.
	await messageBroker.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBroker.createChannel();

	const targetsServiceMessageBroker = new TargetsServiceMessageBroker(messageBroker);
	await messageBroker.setup();
	void targetsServiceMessageBroker.consume();
	return { messageBroker, targetsServiceMessageBroker: targetsServiceMessageBroker };
}

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.TARGETS_DATABASE_PATH);
	const dbConnection = Database.getInstance().connection;

	const { messageBroker, targetsServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		targetRepository: new TargetRepository(dbConnection),
		userRepository: new UserRepository(dbConnection),
		messageBroker: messageBroker,
		targetsServiceMessageBroker: targetsServiceMessageBroker
	};
	ServicesRegistry.setupInitial(services);
}
