import { RequestHandler } from "express-serve-static-core";
import { LoginForm } from "@/auth/AuthServiceAlpha.js";
import { loginFormSchema } from "@/auth/validation/LoginForm.js";
import createHttpError from "http-errors";
import { ResponseBody } from "@/shared/types/Response.js";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import { userResourceSchema } from "@/auth/models/User.js";

export default class AuthenticationHandler {
	public static register: RequestHandler = async (req, res) => {
		const loginForm: LoginForm = loginFormSchema.parse(req.body);

		const newUser = await AuthServiceBeta.getInstance().register(loginForm);
		const userResource = userResourceSchema.parse(newUser);

		const responseBody = {
			status: "success",
			data: {
				user: userResource,
			},
		} satisfies ResponseBody;

		res.json(responseBody);
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
