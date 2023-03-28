import express from "express";
import { loginPost } from "@/auth/routes/index.js";

export const nonAuthenticatedRouter = express.Router();
export const loginRouter = express.Router();
loginRouter.route("/login")
	.post(loginPost);

nonAuthenticatedRouter.use(loginRouter);

export const authenticatedRouter = express.Router();
