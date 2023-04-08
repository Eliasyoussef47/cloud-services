import { ChangeTypes } from "@/shared/types/utility.js";

export const serviceSucces = ["success", "created", "scoreCalculated", "deleted", "scoreCalculationRequested"] as const;
export type ServiceSuccess = typeof serviceSucces[number];

export const serviceError = ["failure", "validationError"] as const;
export type ServiceError = typeof serviceError[number];

export const serviceStatus = [...serviceSucces, ...serviceError];
export type ServiceStatus = typeof serviceStatus[number];

export interface ResponseBody<DataT extends (object | null) = object | null, TStatus extends ServiceStatus = ServiceStatus> {
	status: TStatus;
	data: DataT
}

export const statusCodeStatusMessage: Map<number, ServiceStatus> = new Map([
	[422, "validationError"]
]);

export const toStatusMessage = (statusCode: number): ServiceStatus => {
	const value = statusCodeStatusMessage.get(statusCode);

	if (value) {
		return value;
	}

	if (statusCode >= 400) {
		return "failure";
	}

	return "success";
}

export type ResourceFilter<T> = Partial<ChangeTypes<T, boolean | undefined>>;
