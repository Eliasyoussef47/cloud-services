export interface Submission {
	customId: string;
	userId: string;
	targetId: string;
	source: string;
	base64Encoded: string;
	score: number | null;
	createdAt: Date;
	updatedAt: Date;
}
