import { Submission } from "@/submissionsService/models/Submission.js";
import { IPersistent } from "@/shared/types/database/database.js";
import { ChangeTypes } from "@/shared/types/utility.js";
import { PartialSubmission } from "@/submissionsService/resources/Submission.js";
import { FilterQuery, SortOrder } from "mongoose";

export interface SubmissionPersistent extends Submission, IPersistent<Submission> {
}

export type CreateArgs = Pick<Submission,
	| "customId"
	| "userId"
	| "targetId"
	| "source"
	| "base64Encoded">;

export type SubmissionsSort = ChangeTypes<PartialSubmission, SortOrder>;

export default interface ISubmissionRepository {
	get(customId: string): Promise<SubmissionPersistent | null>;

	getByFiltered(filter: FilterQuery<Submission>, sort?: SubmissionsSort | undefined): Promise<SubmissionPersistent[]>;

	getByTargetId(targetId: string): Promise<SubmissionPersistent[]>;

	create(createArgs: CreateArgs): Promise<SubmissionPersistent>;

	deleteById(id: Submission["customId"]): Promise<boolean>;

	deleteMany(filter: Partial<Submission>): Promise<boolean>;
}
