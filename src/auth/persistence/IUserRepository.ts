import { User } from "@/auth/models/User.js";
import { IPersistent } from "@/shared/types/database/database.js";
import { IUserMethods } from "@/auth/persistence/mongoose/models/User.js";

export interface UserPersistent extends User, IPersistent<User>, IUserMethods {

}

export type CreateParams = Pick<User, "customId" | "opaqueId" | "username" | "password">;

export default interface IUserRepository {
	get(customId: string): Promise<UserPersistent | null>;

	getByOpaqueId(opaqueId: string): Promise<UserPersistent | null>;

	getByUsername(username: string): Promise<UserPersistent | null>;

	// TODO: What errors can this method cause?
	create(createParams: CreateParams): Promise<UserPersistent>;
}
