import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { ConsumeMessage } from "amqplib";
import { ScoreCalculationRequestMessage, ScoreCalculationResponseMessage } from "@/shared/MessageBroker/messages.js";
import { ImageRecognition } from "@/imageRecognitionService/businessLogic/ImageRecognition.js";
import { Submission } from "@/submissionsService/models/Submission.js";
import { Target } from "@/targetsService/models/Target.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import CircuitBreaker, { Options as CircuitBreakerOptions } from "opossum";
import { imagesToProcessQueueName } from "@/shared/MessageBroker/constants.js";

const circuitBreakerOptions: CircuitBreakerOptions = {
	timeout: 10000, // If our function takes longer than 10 seconds, trigger a failure
	errorThresholdPercentage: 10, // When 10% of requests fail, trip the circuit
	resetTimeout: 10000, // After 3 seconds, try again.
	rollingCountTimeout: 1000,
	rollingCountBuckets: 1,
	capacity: 1
};

const imageRecognition = new ImageRecognition();

const imageSimilarityCircuitBreaker = new CircuitBreaker(imageRecognition.getImageSimilarity, circuitBreakerOptions);
imageSimilarityCircuitBreaker.on("failure", () => console.log(`Imagga circuit breaker: failed`));
imageSimilarityCircuitBreaker.on("timeout", () => console.log(`Imagga circuit breaker: timed out`));
// imageSimilarityCircuitBreaker.on("reject", () => console.log(`Imagga circuit breaker: rejected`));
imageSimilarityCircuitBreaker.on("open", () => console.log(`Imagga circuit breaker: opened`));
imageSimilarityCircuitBreaker.on("halfOpen", () => console.log(`Imagga circuit breaker: halfOpened`));
imageSimilarityCircuitBreaker.on("close", () => console.log(`Imagga circuit breaker: closed`));

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
		await this.consume();
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

			channel.consume(imagesToProcessQueue.queue, async (msg) => {
				if (!msg) {
					return;
				}
				await this.scoreCalculationRequestListener(msg);
			}).then();

		} catch (error) {
			console.log(`Error in consume: ${error}`);
		}
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
		const routingKey: RoutingKey = "submissions.image.scoreCalculationRequested";

		this._messageBroker.publish(routingKey, JSON.stringify(scoreCalculationResponse));
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
		let similarityDistance: number | null = null;

		try {
			console.log("Requesting similarity check.");
			similarityDistance = await imageSimilarityCircuitBreaker.fire(parsedMessage.data.target.base64Encoded, parsedMessage.data.submission.base64Encoded);
		} catch (e) {
			const queueStats = await channel.checkQueue(imagesToProcessQueueName);
			console.log("Messages left in queue: ", queueStats.messageCount);
			// console.error("imageSimilarity", e);
		}

		if (similarityDistance != null) {
			channel.ack(msg);
			console.log("Similarity check done: ", similarityDistance);

			this.publishScoreCalculationResponse(parsedMessage.data.submission.customId, parsedMessage.data.target.customId, similarityDistance);
		} else {
			channel.reject(msg, true);
		}
	}
}
