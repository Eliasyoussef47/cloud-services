export interface Target {
	customId: string;
	userId: string;
	source: string;
	base64Encoded: string;
	locationName: string;
	/**
	 * The ID issued by the external image recognition service (Imagga).
	 * @deprecated Not needed. We use base64 instead.
	 */
	externalUploadId: string | null;
	createdAt: Date;
	updatedAt: Date;
}
