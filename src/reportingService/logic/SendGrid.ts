import sgMail from "@sendgrid/mail";
export interface MailContent {
	type: string;
	value: string;
}
export type EmailData = string|{ name?: string; email: string; }
export interface MailData {
	to?: EmailData|EmailData[],
	cc?: EmailData|EmailData[],
	bcc?: EmailData|EmailData[],
	from: EmailData,
	replyTo?: EmailData,
	sendAt?: number,
	subject?: string,
	text?: string,
	html?: string,
	content?: MailContent[],
}
export type MailDataRequired = MailData & (
	{ text: string } | { html: string } | { templateId: string } | { content: MailContent[] & { 0: MailContent } });

export default class SendGrid {
	public constructor(apiKey: string) {
		sgMail.setApiKey(apiKey);
	}

	/**
	 * @throws Whatever sgMail.send() throws.
	 * @param data
	 */
	public async sendEmail(data: MailDataRequired): Promise<boolean> {
		const result = await sgMail.send(data);
		return result[0].statusCode === 200;
	}
}
