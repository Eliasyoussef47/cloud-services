import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { ConsumeMessage } from "amqplib";
import { ScoreCalculationRequest, ScoreCalculationRequestMessage, ScoreCalculationResponse, ScoreCalculationResponseMessage } from "@/shared/MessageBroker/messages.js";
import { ImageRecognition } from "@/imageRecognitionService/businessLogic/ImageRecognition.js";
import { Submission } from "@/submissionsService/models/Submission.js";
import { Target } from "@/targetsService/models/Target.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";

export class ImageRecognitionServiceMessageBroker {
	private _messageBroker: MessageBroker;

	constructor(messageBroker: MessageBroker) {
		this._messageBroker = messageBroker;
	}

	public async assertExchanges(): Promise<boolean> {
		await this._messageBroker.assertExchangeAlpha();
		await this._messageBroker.assertExchangeBravo();

		return true;
	}

	public async setupQueues(): Promise<boolean> {
		await this._messageBroker.setupTargetsServiceQueue();

		return true;
	}

	public async setup() {
		await this.assertExchanges();
		await this.setupQueues();
		void this.consume();
	}

	public async consume(): Promise<void> {
		try {
			const channel = this._messageBroker.channel;
			if (!channel) {
				return;
			}

			const imagesToProcessQueue = this._messageBroker.imagesToProcessQueue;
			if (!imagesToProcessQueue) {
				return;
			}

			channel.consume(imagesToProcessQueue.queue, (msg) => {
				if (!msg) {
					return;
				}
				this.scoreCalculationRequestListener(msg);
			}).then();

		} catch (error) {
			console.log(`Error in consume: ${error}`);
		}
	}

	private async scoreCalculationRequestListener(msg: ConsumeMessage) {
		const channel = this._messageBroker.channel;
		if (!channel) {
			return;
		}

		const messageContentString = msg.content.toString();
		let messageObject;
		try {
			messageObject = JSON.parse(messageContentString);
		} catch (e) {
			channel.reject(msg, false);

			console.warn("Message received from the message broker wasn't JSON:");
			console.warn(e);
			return;
		}

		// TODO: Parse message.
		const parsedMessage = <ScoreCalculationRequestMessage> messageObject;
		const imageRecognition = new ImageRecognition();
		const similarityDistance = await imageRecognition.getImageSimilarity(parsedMessage.data.target.base64Encoded, parsedMessage.data.submission.base64Encoded);
		if (similarityDistance) {
			channel.ack(msg);
		}

		this.publishScoreCalculationResponse(parsedMessage.data.submission.customId, parsedMessage.data.target.customId, similarityDistance);
	}

	public publishScoreCalculationResponse(submissionId: Submission["customId"], targetId: Target["customId"], score: number | null) {
		const scoreCalculationResponse: ScoreCalculationResponseMessage = {
			type: "Submission",
			status: "scoreCalculated",
			data: {
				submission: {
					customId: submissionId,
					score: score
				},
				target: {
					customId: targetId
				}
			}
		};
		const routingKey: RoutingKey = "submissions.image.scoreCalculated";

		this._messageBroker.publish(routingKey, JSON.stringify(scoreCalculationResponse));
	}
}
