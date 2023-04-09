import * as Buffer from "buffer";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const toDataUrl = (mimeType: string, buffer: Buffer) => {
	return `data:${mimeType};base64,${buffer.toString("base64")}`
}

export function basicAuth(username: string, password: string) {
	return btoa(`${username}:${password}`);
}

/**
 * Converts a string to its boolean equivalent.
 * @param value
 * @param defaultValue
 */
export function isTrue(value: string | undefined, defaultValue: boolean = false) {
	if (!value) {
		return defaultValue;
	}

	return /(true)|(1)/gi.test(value);
}

/**
 * Wrapper around {isTrue} to set the default value to `true`.
 * @param value
 */
export function preferTrue(value: string | undefined) {
	return isTrue(value, true);
}

export function noError(statusCode: number): boolean {
	return statusCode >= 200 && statusCode < 300;
}

export function lowerCase(value: unknown) {
	if (!(typeof value === "string" || value instanceof String)) {
		return undefined;
	}

	return value.toLowerCase();
}

export const getParamsWithKeyStripped = (urlParams: URLSearchParams, keyToRemove: string) => {
	const submissionUrlParams = new URLSearchParams();

	for (const [key, value] of urlParams.entries()) {
		const re = new RegExp(`^${keyToRemove}\\.`, "g");
		if (!re.test(key)) {
			continue;
		}

		const newKey = key.replace(re, "");
		submissionUrlParams.append(newKey, value);
	}

	return submissionUrlParams;
};
