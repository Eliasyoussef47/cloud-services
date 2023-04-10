import { RequestHandler } from "express-serve-static-core";
import { LoginForm } from "@/auth/AuthServiceAlpha.js";
import { loginFormSchema } from "@/auth/validation/LoginForm.js";
import createHttpError from "http-errors";
import { ResponseBody } from "@/shared/types/Response.js";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import { userResourceSchema } from "@/auth/models/User.js";
import ServicesRegistry from "@/auth/ServicesRegistry.js";

export default class AuthenticationHandler {
	public static register: RequestHandler<{}, {}, LoginForm> = async (req, res) => {
		const loginForm = req.body;

		const newUser = await AuthServiceBeta.getInstance().register(loginForm);
		if (!newUser) {
			throw createHttpError(500);
		}
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

	public static loginPost: RequestHandler<{}, {}, LoginForm> = async (req, res) => {
		const loginForm: LoginForm = loginFormSchema.parse(req.body);

		const loginJwt = await AuthServiceBeta.getInstance().login(loginForm);

		if (!loginJwt) {
			throw createHttpError(401, "Login info are wrong.");
		}

		const responseBody = {
			status: "success",
			data: {
				token: loginJwt.jwt,
				user: loginJwt.user
			},
		} satisfies ResponseBody;

		res.json(responseBody);
	};
}
