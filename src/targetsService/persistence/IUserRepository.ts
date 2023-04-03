import { User } from "@/targetsService/models/User.js";
import { IPersistent } from "@/shared/types/database/database.js";

export interface UserPersistent extends User, IPersistent<User> {

}

export type CreateParams = Pick<User, "customId">;

export default interface IUserRepository {
	get(customId: string): Promise<UserPersistent | null>;

	create(createParams: CreateParams): Promise<UserPersistent>;
}
