import { LoginForm } from "@/auth/AuthServiceAlpha.js";
import z from "zod";
import { UserPersistent } from "@/auth/persistence/IUserRepository.js";
import ServicesRegistry from "@/auth/ServicesRegistry.js";

export const loginFormSchema = z.object({
	username: z.string(),
	password: z.string()
}) satisfies z.Schema<LoginForm>;

export const registerFormSchema = loginFormSchema.merge(z.object({
	username: z.string().refine(async (val) => {
		let foundUser: UserPersistent | null = null;
		try {
			foundUser = await ServicesRegistry.getInstance().userRepository.getByUsername(val);
		} catch (e) {
			console.error("Error while getting a user.", e);
		}
		return !foundUser;
	}, { message: "The username must be unique." })
})) satisfies z.Schema<LoginForm>;
