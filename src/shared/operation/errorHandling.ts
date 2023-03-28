import { Express } from "express";
import { convertToHttpError, errorHandler, httpErrorHandler } from "@/shared/ErrorHandlers.js";

export function attachErrorHandlers(expressApp: Express) {
	expressApp.use(convertToHttpError);
	expressApp.use(httpErrorHandler);
	expressApp.use(errorHandler);
}
