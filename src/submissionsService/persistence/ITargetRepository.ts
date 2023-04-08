import { Target } from "@/submissionsService/models/Target.js";
import { IPersistent } from "@/shared/types/database/database.js";

export interface TargetPersistent extends Target, IPersistent<Target> {
}

export type CreateArgs = Target;

export default interface ITargetRepository {
	get(customId: string): Promise<TargetPersistent | null>;

	create(createArgs: CreateArgs): Promise<TargetPersistent>;
}

