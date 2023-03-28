import { toZod } from "tozod";
import { LoginForm } from "@/auth/AuthService.js";
import z from "zod";

export const loginFormSchema: toZod<LoginForm> = z.object({
	username: z.string(),
	password: z.string()
});
