import { Submission } from "@/submissionsService/models/Submission.js";
import { defaultServiceCall, getServicesAuthHeaders } from "@/shared/utils/fetch.js";
import { Environment } from "@/shared/operation/Environment.js";
import { getSubmissionsRoute } from "@/submissionsService/routes/submissions.js";
import { StoreBody } from "@/shared/types/submissionsService/index.js";
import { makeTypedFormData } from "@/types/Http.js";

export type IndexArgs = Pick<Submission, "targetId">;
export type StoreBodyComplete = StoreBody & {
	photo: Blob;
};
export type StoreArgs = StoreBodyComplete & Pick<Submission, "targetId">;

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

	public async store(args: StoreArgs) {
		const myHeaders = getServicesAuthHeaders();

		const formDataAlpha = makeTypedFormData<StoreArgs>(args);

		const fetchInit: RequestInit = {
			method: "post",
			headers: myHeaders,
			body: formDataAlpha as FormData
		};

		let url = new URL(Environment.getInstance().submissionServiceUrl);
		const submissionsRoute = getSubmissionsRoute(args.targetId);
		url = new URL(submissionsRoute, url);

		return await defaultServiceCall(url, fetchInit);
	}
}
