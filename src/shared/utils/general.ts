import * as Buffer from "buffer";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const toDataUrl = (mimeType: string, buffer: Buffer) => {
	return `data:${mimeType};base64,${buffer.toString("base64")}`
}

export function basicAuth(username: string, password: string) {
	return btoa(`${username}:${password}`);
}

export function isTrue(value: string) {
	return /(true)|(1)/gi.test(value);
}

export function noError(statusCode: number): boolean {
	return statusCode >= 200 && statusCode < 300;
}
