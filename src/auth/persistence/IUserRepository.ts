import { User } from "@/auth/models/User.js";
import { IPersistent } from "@/shared/types/database/database.js";

export interface UserPersistent extends User, IPersistent<User> {

}

export type CreateParams = Pick<User, "customId" | "userId" | "username" | "password">;

export default interface IUserRepository {
	get(customId: string): Promise<UserPersistent | null>;
	getByUserId(userId: string): Promise<UserPersistent | null>;

	getByUsername(username: string): Promise<UserPersistent | null>;

	// TODO: What errors can this method cause?
	create(createParams: CreateParams): Promise<UserPersistent>;
}
