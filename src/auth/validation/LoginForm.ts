import { toZod } from "tozod";
import { LoginForm } from "@/auth/AuthServiceAlpha.js";
import z from "zod";

export const loginFormSchema: toZod<LoginForm> = z.object({
	username: z.string(),
	password: z.string()
});
