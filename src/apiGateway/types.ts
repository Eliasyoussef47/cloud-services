export type ServiceCallResult<TData extends object | null> = {
	statusCode: number;
	body: TData;
}
