import { z } from "zod";
import { serviceStatus, ServiceStatus } from "@/shared/types/Response.js";

const isServiceStatusValidator = (val: unknown) => {
	let valString: string;
	try {
		let valStringTemp = val?.toString();
		if (!valStringTemp) {
			return false;
		}
		valString = valStringTemp;
	} catch (e) {
		return false;
	}
	return serviceStatus.includes(<ServiceStatus> valString);
};

const serviceStatusSchema = z.custom<ServiceStatus>(() => {
	return z.string().refine(isServiceStatusValidator);
});

export const responseBodySchema = z.object({
	status: serviceStatusSchema,
	data: z.null(z.unknown())
});
