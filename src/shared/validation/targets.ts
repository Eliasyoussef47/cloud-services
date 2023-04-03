import { z } from "zod";

export const multerFileSchema = z.custom<Express.Multer.File>((val) => {
	return z.object({}).safeParse(val).success
}, "Request must include a photo object.");

export const storeFilesSchema = z.object({
	photo: z.array(multerFileSchema,
		{
			errorMap: (issue, _ctx) => {
				return { message: "Request must include a photo." }
			}
		})
});

export const storeBodySchema = z.object({
	locationName: z.string()
});
