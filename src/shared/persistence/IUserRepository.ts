import { User } from "@/shared/models/User.js";
import { IPersistent } from "@/shared/types/database/database.js";

export interface UserPersistent extends User, IPersistent<User> {
}

export type CreateParams = User;

export default interface IUserRepository {
	get(customId: string): Promise<UserPersistent | null>;

	create(createParams: CreateParams): Promise<UserPersistent>;
}
