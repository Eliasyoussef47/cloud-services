import { toZod } from "tozod";
import { Target } from "@/targetsService/models/Target.js";
import { z } from "zod";
import { ChangeTypes, Mask } from "@/shared/types/utility.js";
import { ResourceFilter } from "@/shared/types/Response.js";

export type PartialTarget = Partial<Target>;

export const targetResource: toZod<Target> = z.object({
	customId: z.string(),
	userId: z.string(),
	source: z.string(),
	base64Encoded: z.string(),
	locationName: z.string(),
	externalUploadId: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const defaultTargetFilter: ChangeTypes<Target, boolean> = {
	customId: true,
	userId: true,
	source: true,
	base64Encoded: true,
	locationName: true,
	externalUploadId: true,
	createdAt: true,
	updatedAt: true,
};

export const createTargetResourceSchema = (filter: ResourceFilter<PartialTarget> = defaultTargetFilter) => {
	const mask = {
		...(filter.customId && { customId: true }),
		...(filter.userId && { userId: true }),
		...(filter.source && { source: true }),
		...(filter.base64Encoded && { base64Encoded: true }),
		...(filter.locationName && { locationName: true }),
		...(filter.externalUploadId && { externalUploadId: true }),
		...(filter.createdAt && { createdAt: true }),
		...(filter.updatedAt && { updatedAt: true }),
	} satisfies Mask<Target>;

	return targetResource.pick(mask);
};
