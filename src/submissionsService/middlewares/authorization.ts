import { RequestHandler, RouteParameters } from "express-serve-static-core";
import { AuthorizationState } from "@/shared/authorization/AuthorizationHandler.js";
import { GatewayJwtUser } from "@/auth/AuthServiceAlpha.js";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { getDefaultAuthorizationError } from "@/shared/operation/errorHandling.js";
import { Submission } from "@/submissionsService/models/Submission.js";
import { Target } from "@/submissionsService/models/Target.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import createHttpError from "http-errors";

export const ownsSubmission: RequestHandler = async (req, res, next) => {
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

	const belongsToTarget = await ServicesRegistry.getInstance().targetRepository.get(submission.targetId);

	if (!belongsToTarget) {
		throw createHttpError<404>(404, "The target that this submission belongs to wasn't found");
	}

	// If the user doesn't own the submission and doesn't own the target.
	if (submission.userId != user.customId && user.customId != belongsToTarget.userId) {
		// res.locals.authorizationState = AuthorizationState.DENIED;
		next(getDefaultAuthorizationError());
		return;
	}

	res.locals.authorizationState = AuthorizationState.UNDETERMINED;
	next();
};

type targetSubmissionsRequestHandler = RequestHandler<RouteParameters<"/targets/:targetId/submissions">, {}, {}, {}, { target: Target }>;

export const targetOwnerCannotSubmit: targetSubmissionsRequestHandler = (req, res, next) => {
	if (res.locals.authorizationState === AuthorizationState.GRANTED) {
		next();
		return;
	}

	const user = req.user as GatewayJwtUser;

	if (res.locals.target.userId == user.customId) {
		throw getDefaultAuthorizationError("A user can't submit to his own target.");
	}

	next();
};
