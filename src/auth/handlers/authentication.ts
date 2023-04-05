import { RequestHandler } from "express-serve-static-core";
import { LoginForm } from "@/auth/AuthServiceAlpha.js";
import { loginFormSchema } from "@/auth/validation/LoginForm.js";
import createHttpError from "http-errors";
import { ResponseBody } from "@/shared/types/Response.js";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import { userResourceSchema } from "@/auth/models/User.js";
import z from "zod";
import ServicesRegistry from "@/auth/ServicesRegistry.js";

export const registerFormSchema = loginFormSchema.merge(z.object({
	username: z.string().refine(async (val) => {
		const foundUser = await ServicesRegistry.getInstance().userRepository.getByUsername(val);
		return !foundUser;
	}, {message: "The username must be unique."})
}));

export default class AuthenticationHandler {
	public static register: RequestHandler = async (req, res) => {
		const loginForm: LoginForm = await registerFormSchema.parseAsync(req.body);

		const newUser = await AuthServiceBeta.getInstance().register(loginForm);
		const userResource = userResourceSchema.parse(newUser);

		const responseBody = {
			status: "success",
			data: {
				user: userResource,
			},
		} satisfies ResponseBody;

		res.json(responseBody);

		ServicesRegistry.getInstance().authServiceMessageBroker.publishUserCreated({customId: newUser.customId});
	};

	public static loginPost: RequestHandler = async (req, res) => {
		const loginForm: LoginForm = loginFormSchema.parse(req.body);

		const loginJwt = await AuthServiceBeta.getInstance().login(loginForm);

		if (!loginJwt) {
			throw createHttpError(401);
		}

		const responseBody = {
			status: "success",
			data: {
				token: loginJwt,
			},
		} satisfies ResponseBody;

		res.json(responseBody);
	};
}
