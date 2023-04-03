import { IPersistent } from "@/shared/types/database/database.js";
import { Target } from "@/targetsService/models/Target.js";

export interface TargetPersistent extends Target, IPersistent<Target> {

}

export type CreateArgs = Pick<Target, "customId" | "userId" | "source" | "base64Encoded" | "locationName">;

export default interface ITargetRepository {
	get(customId: string): Promise<TargetPersistent | null>;

	create(createArgs: CreateArgs): Promise<TargetPersistent>
}
