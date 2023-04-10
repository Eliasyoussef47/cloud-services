import { z } from "zod";

interface ImaggaSimilarityResponse {
	result: {
		distance: number;
	};
}

export const imagesSimilarityResponseSchema = z.object({
	result: z.object({ distance: z.number() }),
	// status: z.object({ text: z.string(), type: z.string() })
}).passthrough() satisfies z.Schema<ImaggaSimilarityResponse>;
