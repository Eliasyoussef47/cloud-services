import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { messageBrokerMessageBaseSchema, ScoreCalculationResponseMessage, scoreCalculationResponseSchema } from "@/shared/MessageBroker/messages.js";
import { SubmissionPersistent } from "@/submissionsService/persistence/ISubmissionRepository.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import { ConsumeMessage } from "amqplib";

export default class ReportingServiceMessageBroker {
	private _messageBroker: MessageBroker;

	constructor(messageBroker: MessageBroker) {
		this._messageBroker = messageBroker;
	}

	public async consume(): Promise<void> {
		try {
			const channel = this._messageBroker.channel;
			if (!channel) {
				return;
			}

			// TODO: change queue.
			const submissionScoreCalculatedQueue = this._messageBroker.submissionScoreCalculatedQueue;
			if (!submissionScoreCalculatedQueue) {
				return;
			}

			channel.consume(submissionScoreCalculatedQueue.queue, async (msg) => {
				if (!msg) {
					return;
				}
				await this.submissionScoreCalculatedQueueListener(msg);
			})
				.then()
				.catch(e => console.log(`Error in consume: `, e));

		} catch (error) {
			console.log(`Error in consume: `, error);
		}
	}

	private async submissionScoreCalculatedQueueListener(msg: ConsumeMessage) {
		const channel = this._messageBroker.channel;
		if (!channel) {
			return;
		}

		let messageObject: any;

		const messageContentString = msg.content.toString();
		try {
			messageObject = JSON.parse(messageContentString);
		} catch (e) {
			channel.reject(msg, false);

			console.warn("Message received from the message broker wasn't JSON:");
			console.warn(e);
			return;
		}

		const messageParsed = messageBrokerMessageBaseSchema.safeParse(messageObject);

		// If the message doesn't have the correct format.
		if (!messageParsed.success) {
			// Reject and discard the message.
			channel.reject(msg, false);
			console.warn("Message received from the message broker has the wrong format.");
			return;
		}

		// Test if the message is the result of the score calculation.
		const parsedScoreCalculationResponseSchema = scoreCalculationResponseSchema.safeParse(messageParsed.data);
		if (parsedScoreCalculationResponseSchema.success) {
			channel.ack(msg);
			void this.consumeScoreCalculationResponse(parsedScoreCalculationResponseSchema.data);
			return;
		}
	}

	private async consumeScoreCalculationResponse(message: ScoreCalculationResponseMessage) {
		// TODO: Send email about score calculation response.
	}
}
