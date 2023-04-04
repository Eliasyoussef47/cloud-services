import { Require_id, ToObjectOptions } from "mongoose";

export interface IPersistent<T> {
	save(): Promise<T>;
	toObject<O = Require_id<T>>(options?: ToObjectOptions): Require_id<T>;
}
