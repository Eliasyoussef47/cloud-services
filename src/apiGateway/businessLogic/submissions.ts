import { Submission } from "@/submissionsService/models/Submission.js";
import { defaultServiceCall, getServicesAuthHeaders } from "@/shared/utils/fetch.js";
import { Environment } from "@/shared/operation/Environment.js";
import { getSubmissionsRoute } from "@/submissionsService/routes/submissions.js";

export type IndexArgs = Pick<Submission, "targetId">;

export default class Submissions {
	// TODO: User based authorization.
	public async index(args: IndexArgs): Promise<Response> {
		const fetchInit: RequestInit = {
			method: "get",
			headers: getServicesAuthHeaders()
		};

		let url = new URL(Environment.getInstance().submissionServiceUrl);
		const submissionsRoute = getSubmissionsRoute(args.targetId);
		url = new URL(submissionsRoute, url);

		return await defaultServiceCall(url, fetchInit);
	}
}
