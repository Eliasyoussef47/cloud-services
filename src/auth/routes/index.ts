import { RequestHandler, RouteParameters } from "express-serve-static-core";
import { AuthService, LoginForm } from "@/auth/AuthService.js";
import { loginFormSchema } from "@/auth/validation/LoginForm.js";
import createHttpError from "http-errors";
import express from "express";

export const loginPost: RequestHandler = (req, res, next) => {
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
	};

	res.json(responseBody);
};


