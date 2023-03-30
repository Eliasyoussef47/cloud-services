import { Express } from "express";
import { convertToHttpError, errorHandler, httpErrorHandler, notFoundHandler } from "@/shared/ErrorHandlers.js";

/**
 * Attaches all error handling middlewares to an Express app.
 * @param expressApp The app which the middlewares will be attached to.
 */
export function attachErrorHandlers(expressApp: Express) {
	expressApp.use(notFoundHandler);
	expressApp.use(convertToHttpError);
	expressApp.use(httpErrorHandler);
	expressApp.use(errorHandler);
}
