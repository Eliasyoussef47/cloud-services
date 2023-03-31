export interface IPersistent<T> {
	save(): Promise<T>;
}
