import { z } from "zod";

export const imagesSimilarityResponseSchema = z.object({
	result: z.object({ distance: z.number() }),
	// status: z.object({ text: z.string(), type: z.string() })
}).passthrough();

export type ImaggaSimilarityResponse = z.infer<typeof imagesSimilarityResponseSchema>;
