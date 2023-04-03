export interface Target {
	customId: string;
	userId: string;
	source: string;
	base64Encoded: string;
	locationName: string;
	/**
	 * The ID issued by the external image recognition service (Imagga).
	 */
	externalUploadId: string | null;
	createdAt: Date;
}
