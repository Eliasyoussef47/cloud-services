import express from "express";
import AuthenticationHandler from "@/auth/handlers/authentication.js";
import { makeValidatedRouteHandler } from "@/shared/utils/makeValidatedRouteHandler.js";
import { loginFormSchema, registerFormSchema } from "@/auth/validation/LoginForm.js";

const register = makeValidatedRouteHandler(AuthenticationHandler.register, null, registerFormSchema);
const loginPost = makeValidatedRouteHandler(AuthenticationHandler.loginPost, null, loginFormSchema);

export const authenticationRouter = express.Router();
authenticationRouter.route("/register")
	.post(register);
authenticationRouter.route("/login")
	.post(loginPost);
