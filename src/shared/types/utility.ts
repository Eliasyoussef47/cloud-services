export type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ChangeTypes<T, N> = { [K in keyof T]: N };
export type Mask<T> = {
	[k in keyof T]?: true;
};
