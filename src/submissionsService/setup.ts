import Database from "@/shared/persistence/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import UserRepository from "@/shared/persistence/mongoose/UserRepository.js";
import TargetRepository from "@/submissionsService/persistence/mongoose/TargetRepository.js";
import ServicesRegistry, { Services } from "@/submissionsService/ServiceRegistry.js";
import { SubmissionsServiceMessageBroker } from "@/submissionsService/MessageBroker/SubmissionsServiceMessageBroker.js";
import SubmissionRepository from "@/submissionsService/persistence/mongoose/SubmissionRepository.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";

async function setupMessageBroker() {
	const messageBroker = new MessageBroker();
	// TODO: Check first if the connection and channel was established.
	await messageBroker.connect(Environment.getInstance().envFile.MESSAGE_BROKER_URL);
	await messageBroker.createChannel();

	const submissionsServiceMessageBroker = new SubmissionsServiceMessageBroker(messageBroker);
	await messageBroker.setup();
	void submissionsServiceMessageBroker.consume();
	return { messageBroker, submissionsServiceMessageBroker };
}

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.SUBMISSIONS_DATABASE_PATH);
	const dbConnection = Database.getInstance().connection;

	const { messageBroker, submissionsServiceMessageBroker } = await setupMessageBroker();

	const services: Services = {
		targetRepository: new TargetRepository(dbConnection),
		userRepository: new UserRepository(dbConnection),
		submissionRepository: new SubmissionRepository(dbConnection),
		messageBroker: messageBroker,
		submissionsServiceMessageBroker
	};
	ServicesRegistry.setupInitial(services);
}
