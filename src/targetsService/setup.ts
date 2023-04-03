import Database from "@/shared/mongoose/Database.js";
import { Environment } from "@/shared/operation/Environment.js";
import ServicesRegistry, { Services } from "@/targetsService/ServiceRegistry.js";
import TargetRepository from "@/targetsService/persistence/mongoose/TargetRepository.js";
import UserRepository from "@/targetsService/persistence/mongoose/UserRepository.js";

export async function setupDependencies() {
	await Database.setup(Environment.getInstance().envFile.TARGETS_DATABASE_PATH);
	const dbConnection = Database.getInstance().connection;
	const services: Services = {
		targetRepository: new TargetRepository(dbConnection),
		userRepository: new UserRepository(dbConnection)
	}
	ServicesRegistry.setupInitial(services);
}
