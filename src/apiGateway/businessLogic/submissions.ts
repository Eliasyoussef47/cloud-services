import { Submission } from "@/submissionsService/models/Submission.js";
import { defaultServiceCall, getServicesAuthHeaders } from "@/shared/utils/fetch.js";
import { Environment } from "@/shared/operation/Environment.js";
import { getTargetsSubmissionsRoute } from "@/submissionsService/routes/submissions.js";
import { StoreBody } from "@/shared/types/submissionsService/index.js";
import { makeTypedFormData } from "@/types/Http.js";
import { Target } from "@/targetsService/models/Target.js";

export type IndexArgs = Pick<Submission, "targetId">;
export type StoreBodyComplete = StoreBody & {
	photo: Blob;
};
export type StoreArgs = StoreBodyComplete & Pick<Submission, "targetId">;

export type ShowArgs = {
	id: Submission["customId"]
}

export default class Submissions {
	// TODO: User based authorization.
	public async index(args: IndexArgs): Promise<Response> {
		const fetchInit: RequestInit = {
			method: "get",
			headers: getServicesAuthHeaders()
		};

		let url = new URL(Environment.getInstance().submissionServiceUrl);
		const submissionsRoute = getTargetsSubmissionsRoute(args.targetId);
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
		const submissionsRoute = getTargetsSubmissionsRoute(args.targetId);
		url = new URL(submissionsRoute, url);

		return await defaultServiceCall(url, fetchInit);
	}

	public async show(args: ShowArgs): Promise<Response> {
		const fetchInit: RequestInit = {
			method: "get",
			headers: getServicesAuthHeaders()
		};

		let url = new URL(Environment.getInstance().submissionServiceUrl);
		url = new URL(args.id, url);

		return await defaultServiceCall(url, fetchInit);
	}
}
