// TODO: Use database.
import { toZod } from "tozod";
import z from "zod";

export interface User {
	/**
	 * Implementation specific ID used by this system. The database's ID (e.g. MongoDB) isn't used for identification.
	 * This is done to lessen the dependency on the behavior of the database.
	 */
	customId: string;
	/**
	 * Fake and temporary ID issued to the user's JWT to obscure the real ID in the database.
	 */
	opaqueId: string;
	username: string;
	password: string;
}

export const userResourceSchema: toZod<Pick<User, "opaqueId" | "username">> = z.object({
	opaqueId: z.string(),
	username: z.string()
});
