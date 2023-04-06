import { Submission } from "@/submissionsService/models/Submission.js";
import { IPersistent } from "@/shared/types/database/database.js";

export interface SubmissionPersistent extends Submission, IPersistent<Submission> {
}

export type CreateArgs = Pick<Submission,
	| "customId"
	| "userId"
	| "targetId"
	| "source"
	| "base64Encoded">;

export default interface ISubmissionRepository {
	get(customId: string): Promise<SubmissionPersistent | null>;
	getByTargetId(targetId: string): Promise<SubmissionPersistent[]>;

	create(createArgs: CreateArgs): Promise<SubmissionPersistent>
}
