import { User } from "@/auth/models/User.js";

export type CreateParams = {
	customId: string;
	username: string;
	password: string;
}

export default interface IUserRepository {
	get(customId: string): Promise<User | null>;
	getByUsername(username: string): Promise<User | null>
	// TODO: What errors can this method cause.
	create(createParams: CreateParams): Promise<User>;
}
