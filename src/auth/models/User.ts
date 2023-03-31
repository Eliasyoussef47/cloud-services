// TODO: Use database.
import { toZod } from "tozod";
import z from "zod";

export interface User {
	customId: string;
	userId: string;
	username: string;
	password: string;
}

export const userResourceSchema: toZod<Pick<User, "userId" | "username">> = z.object({
	userId: z.string(),
	username: z.string()
});
