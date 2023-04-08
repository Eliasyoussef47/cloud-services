import { Submission } from "@/submissionsService/models/Submission.js";
import { toZod } from "tozod";
import { z } from "zod";
import { ChangeTypes, Mask } from "@/shared/types/utility.js";
import { ResourceFilter } from "@/shared/types/Response.js";
import { Target } from "@/targetsService/models/Target.js";

export type PartialSubmission = Partial<Submission>;

export const submissionResource: toZod<Submission> = z.object({
	customId: z.string(),
	userId: z.string(),
	targetId: z.string(),
	source: z.string(),
	base64Encoded: z.string(),
	score: z.number().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const defaultSubmissionFilter: ChangeTypes<Submission, boolean> = {
	customId: true,
	userId: true,
	targetId: true,
	source: true,
	base64Encoded: true,
	score: true,
	createdAt: true,
	updatedAt: true,
};

export const createSubmissionResourceSchema = (filter: ResourceFilter<PartialSubmission> = defaultSubmissionFilter) => {
	const mask = {
		...(filter.customId && { customId: true }),
		...(filter.userId && { userId: true }),
		...(filter.targetId && { targetId: true }),
		...(filter.source && { source: true }),
		...(filter.base64Encoded && { base64Encoded: true }),
		...(filter.score && { score: true }),
		...(filter.createdAt && { createdAt: true }),
		...(filter.updatedAt && { updatedAt: true }),
	} satisfies Mask<Submission>;

	return submissionResource.pick(mask);
};
