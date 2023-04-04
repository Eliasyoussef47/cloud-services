import * as Buffer from "buffer";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const toDataUrl = (mimeType: string, buffer: Buffer) => {
	return `data:${mimeType};base64,${buffer.toString("base64")}`
}
