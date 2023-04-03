type TypedFormDataValue = FormDataEntryValue | Blob;
type FormDataTemplateAlpha<T> = {
	[key in keyof T]?: TypedFormDataValue;
};
type FormDataTemplateBeta<T> = Record<string, TypedFormDataValue>;
type SearchParamsTemplate<T> = {
	[key in keyof T]?: string;
};

/**
 * Polyfill for FormData Generic
 *
 * {@link https://github.com/microsoft/TypeScript/issues/43797}
 * {@link https://xhr.spec.whatwg.org/#interface-formdata}
 */
export interface ITypedFormData<T extends FormDataTemplateAlpha<T>> {
	/**
	 * Appends a new value onto an existing key inside a FormData object, or adds the key if
	 * it does not already exist.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.append}
	 */
	append<K extends keyof T>(name: K, value: T[K], fileName?: string): void

	/**
	 * Deletes a key/value pair from a FormData object.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.delete}
	 */
	delete(name: keyof T): void

	/**
	 * Returns an iterator allowing to go through all key/value pairs contained in this object.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.entries}
	 */
	entries<K extends keyof T>(): IterableIterator<[K, T[K]]>

	/**
	 * Returns the first value associated with a given key from within a FormData object.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.get}
	 */
	get<K extends keyof T>(name: K): T[K] | null

	/**
	 * Returns an array of all the values associated with a given key from within a FormData.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.getall}
	 */
	getAll<K extends keyof T>(name: K): Array<T[K]>

	/**
	 * Returns a boolean stating whether a FormData object contains a certain key.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.has}
	 */
	has(name: keyof T): boolean

	/**
	 * Returns an iterator allowing to go through all keys of the key/value pairs contained in
	 * this object.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.keys}
	 */
	keys(): IterableIterator<keyof T>

	/**
	 * Sets a new value for an existing key inside a FormData object, or adds the key/value
	 * if it does not already exist.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.set}
	 */
	set<K extends keyof T>(name: K, value: T[K], fileName?: string): void

	/**
	 * Returns an iterator allowing to go through all values contained in this object.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData#formdata.values}
	 */
	values(): IterableIterator<T[keyof T]>

	forEach<K extends keyof T>(
		callbackFunction: (value: T[K], key: K, parent: ITypedFormData<T>) => void,
		thisArg?: unknown,
	): void
}

export const makeTypedFormData = <T extends FormDataTemplateAlpha<T>>(values: T): ITypedFormData<T> => {
	const result = new FormData() as unknown as ITypedFormData<T>;
	for (const key in values) {
		result.append(key, values[key]);
	}

	return result;
};

class TypedFormData<T extends FormDataTemplateAlpha<T>> extends FormData implements ITypedFormData<T> {
	// @ts-ignore
	public append<K extends keyof T>(name: K, value: T[K], fileName?: string): void {
		// @ts-ignore
		super.append(name, value);
	}

	// @ts-ignore
	public delete(name: keyof T): void {
		// @ts-ignore
		super.delete(name);
	}

	// @ts-ignore
	public entries<K extends keyof T>(): IterableIterator<[K, T[K]]> {
		// @ts-ignore
		return super.entries();
	}

	// @ts-ignore
	public forEach<K extends keyof T>(callbackFunction: (value: T[K], key: K, parent: ITypedFormData<T>) => void, thisArg?: unknown): void {
		// @ts-ignore
		return super.forEach(callbackFunction);
	}

	// @ts-ignore
	public get<K extends keyof T>(name: K): T[K] | null {
		// @ts-ignore
		return super.get(name);
	}

	// @ts-ignore
	public getAll<K extends keyof T>(name: K): Array<T[K]> {
		// @ts-ignore
		return super.getAll(name);
	}

	// @ts-ignore
	public has(name: keyof T): boolean {
		// @ts-ignore
		return super.has(name);
	}

	// @ts-ignore
	public keys(): IterableIterator<keyof T> {
		// @ts-ignore
		return super.keys();
	}

	// @ts-ignore
	public set<K extends keyof T>(name: keyof T, value: T[K], fileName?: string): void {
		// @ts-ignore
		super.set(name, value, fileName);
	}

	// @ts-ignore
	public values(): IterableIterator<T[keyof T]> {
		// @ts-ignore
		return super.values();
	}

}

export interface ITypedURLSearchParams<T extends SearchParamsTemplate<T>> {
	/** Appends a specified key/value pair as a new search parameter. */
	append<K extends keyof T>(name: K, value: string): void;

	/** Deletes the given search parameter, and its associated value, from the list of all search parameters. */
	delete<K extends keyof T>(name: K): void;

	/** Returns the first value associated to the given search parameter. */
	get<K extends keyof T>(name: K): string | null;

	/** Returns all the values association with a given search parameter. */
	getAll<K extends keyof T>(name: K): string[];

	/** Returns a Boolean indicating if such a search parameter exists. */
	has<K extends keyof T>(name: K): boolean;

	/** Sets the value associated to a given search parameter to the given value. If there were several values, delete the others. */
	set<K extends keyof T>(name: K, value: T[K]): void;

	sort(): void;

	/** Returns a string containing a query string suitable for use in a URL. Does not include the question mark. */
	toString(): string;

	forEach<K extends keyof T>(
		callbackfn: (value: T[K], key: K, parent: ITypedURLSearchParams<T>) => void,
		thisArg?: any
	): void;
}

export const makeTypedSearchParams = <T extends SearchParamsTemplate<T>>(searchParams: URLSearchParams, values: T): ITypedURLSearchParams<T> => {
	const result = searchParams as unknown as ITypedURLSearchParams<T>;
	for (const key in values) {
		const unwrappedValue = values[key];
		if (!unwrappedValue) {
			continue;
		}
		result.append(key, unwrappedValue);
	}

	return result;
};
