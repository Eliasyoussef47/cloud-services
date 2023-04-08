import { RequestHandler } from "express-serve-static-core";
import { AuthorizationState } from "@/shared/authorization/AuthorizationHandler.js";
import { GatewayJwtUser } from "@/auth/AuthServiceAlpha.js";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { getDefaultAuthorizationError } from "@/shared/operation/errorHandling.js";
import { Submission } from "@/submissionsService/models/Submission.js";


export const ownsSubmission: RequestHandler = (req, res, next) => {
	if (res.locals.authorizationState === AuthorizationState.GRANTED) {
		next();
		return;
	}

	const submission = res?.locals.submission as (Submission | undefined);
	const user = req.user as (GatewayJwtUser | undefined);
	if (!submission) {
		throw new CustomError("Submission wasn't found in the locals.");
	}
	if (!user) {
		throw new CustomError("User wasn't found in the locals.");
	}

	if (submission.userId != user.customId) {
		// res.locals.authorizationState = AuthorizationState.DENIED;
		next(getDefaultAuthorizationError());
		return;
	}

	res.locals.authorizationState = AuthorizationState.UNDETERMINED;
	next();
};
