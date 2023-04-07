import { ServiceError } from "@/shared/types/errors/ServiceError.js";

export default class ImaggaError extends ServiceError {
	constructor(message: string) {
		super("Imagga", message);
	}
}
