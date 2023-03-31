import ServicesRegistry, { Services } from "@/auth/ServicesRegistry.js";
import UserRepository from "@/auth/persistence/mongoose/UserRepository.js";
import AuthDatabase from "@/auth/persistence/mongoose/Database.js";
export async function setupDependencies() {
	await AuthDatabase.setup();
	const services: Services = {
		userRepository: new UserRepository(AuthDatabase.getInstance().connection)
	}
	ServicesRegistry.setupInitial(services);
}
