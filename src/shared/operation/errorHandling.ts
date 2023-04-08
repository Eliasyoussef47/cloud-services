import { Express } from "express";
import { convertToHttpError, errorHandler, httpErrorHandler, notFoundHandler } from "@/shared/ErrorHandlers.js";
import createHttpError from "http-errors";

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

export function getDefaultAuthorizationError() {
	return createHttpError<403>(403, "User doesn't satisfy the authorization rules.");
}
