import { IPersistent } from "@/shared/types/database/database.js";
import { Target } from "@/targetsService/models/Target.js";
import { PaginationOptions } from "@/shared/types/database/index.js";

export interface TargetPersistent extends Target, IPersistent<Target> {
}

export type CreateArgs = Pick<Target,
	| "customId"
	| "userId"
	| "source"
	| "base64Encoded"
	| "locationName">;

export type PaginationInfo = PaginationOptions & {
	total: number;
};

export type PaginatedList = {
	targets: TargetPersistent[];
	paginationInfo: PaginationInfo;
};

export default interface ITargetRepository {
	get(customId: string): Promise<TargetPersistent | null>;
	getByUserId(userId: string): Promise<TargetPersistent[]>;
	getAll(filter?: Partial<Target>): Promise<TargetPersistent[]>;
	getAllPaginated(pagination: PaginationOptions, filter?: Partial<Target>): Promise<PaginatedList>;
	create(createArgs: CreateArgs): Promise<TargetPersistent>
	deleteById(id: Target["customId"]): Promise<boolean>;
}
