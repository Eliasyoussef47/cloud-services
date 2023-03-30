import { RequestHandler } from "express-serve-static-core";
import { AuthService, LoginForm } from "@/auth/AuthService.js";
import { loginFormSchema } from "@/auth/validation/LoginForm.js";
import createHttpError from "http-errors";
import { ResponseBody } from "@/shared/types/Response.js";

export default class AuthenticationHandler {
	public static loginPost: RequestHandler = (req, res) => {
		const loginForm: LoginForm = loginFormSchema.parse(req.body);

		const loginJwt = AuthService.getInstance().login(loginForm);

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
