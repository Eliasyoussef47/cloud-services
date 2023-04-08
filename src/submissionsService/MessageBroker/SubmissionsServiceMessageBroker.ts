import { ConsumeMessage } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { messageBrokerMessageBaseSchema, ScoreCalculationRequestMessage, ScoreCalculationResponseMessage, scoreCalculationResponseSchema, TargetCreatedMessage, targetCreatedMessageSchema, TargetDeletedMessage, targetDeletedMessageSchema, UserCreatedMessage, userCreatedMessageSchema } from "@/shared/MessageBroker/messages.js";
import { submissionServiceCallbackQueueName, targetsServiceRpcQueueName } from "@/shared/MessageBroker/constants.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { TargetRpcRequest, TargetRpcResponse, targetRpcResponseSchema } from "@/shared/types/rpc/index.js";
import { Submission } from "@/submissionsService/models/Submission.js";
import { Options } from "amqplib/properties.js";
import { Target } from "@/targetsService/models/Target.js";
import { CreateArgs } from "@/submissionsService/persistence/ITargetRepository.js";
import { SubmissionPersistent } from "@/submissionsService/persistence/ISubmissionRepository.js";

export class SubmissionsServiceMessageBroker {
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

			const submissionsServiceQueue = this._messageBroker.submissionsServiceQueue;
			if (!submissionsServiceQueue) {
				return;
			}

			channel.consume(submissionsServiceQueue.queue, (msg) => {
				if (!msg) {
					return;
				}
				this.submissionsServiceQueueListener(msg);
			}).then();

			const submissionServiceCallbackQueue = this._messageBroker.submissionServiceCallbackQueue;
			if (!submissionServiceCallbackQueue) {
				return;
			}

			channel.consume(submissionServiceCallbackQueue.queue, (msg) => {
				if (!msg) {
					return;
				}
				this.submissionServiceCallbackQueueListener(msg);
			}).then();

		} catch (error) {
			console.log(`Error in consume: ${error}`);
		}
	}

	public async submissionsServiceQueueListener(msg: ConsumeMessage): Promise<void> {
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

		// Test if the message is about a newly created target.
		const parsedMessageTargetCreated = targetCreatedMessageSchema.safeParse(messageParsed.data);
		if (parsedMessageTargetCreated.success) {
			await this.consumeTargetCreated(parsedMessageTargetCreated.data);
			channel.ack(msg);
			return;
		}

		// Test if the message is about a newly created user.
		const parsedMessageUserCreated = userCreatedMessageSchema.safeParse(messageParsed.data);
		if (parsedMessageUserCreated.success) {
			channel.ack(msg);
			void this.consumeUserCreated(parsedMessageUserCreated.data);
			return;
		}

		// Test if the message is the result of the score calculation.
		const parsedScoreCalculationResponseSchema = scoreCalculationResponseSchema.safeParse(messageParsed.data);
		if (parsedScoreCalculationResponseSchema.success) {
			channel.ack(msg);
			void this.consumeScoreCalculationResponse(parsedScoreCalculationResponseSchema.data);
			return;
		}

		// Test if the message is the result of the score calculation.
		const parsedMessageTargetDeleted = targetDeletedMessageSchema.safeParse(messageParsed.data);
		if (parsedMessageTargetDeleted.success) {
			await this.consumeTargetDeleted(parsedMessageTargetDeleted.data);
			channel.ack(msg);
			return;
		}

		channel.reject(msg, false);
		console.warn("Message received from the message broker was unprocessable.");
	}

	public async consumeRpcTargetResponse(correlationId: string, msg: TargetRpcResponse) {
		this.publishScoreCalculationRequest(msg.body.submission, msg.body.target);
	}

	public publishSubmissionTargetRequest(submission: Submission): boolean {
		const requestMessage: TargetRpcRequest = {
			request: {
				method: "get",
				requestUri: "target"
			},
			body: {
				submission: submission
			}
		};

		const messageOptions: Options.Publish = {
			correlationId: submission.targetId,
			replyTo: submissionServiceCallbackQueueName
		};

		return this._messageBroker.publishToQueue(targetsServiceRpcQueueName, JSON.stringify(requestMessage), messageOptions);
	}

	public publishScoreCalculationRequest(submission: Submission, target: Target): boolean {
		const scoreCalculationRequest: ScoreCalculationRequestMessage = {
			type: "Submission",
			status: "scoreCalculationRequested",
			data: {
				submission: submission,
				target: target
			}
		};

		const routingKey: RoutingKey = "submissions.image.scoreCalculationRequested";

		return this._messageBroker.publish(routingKey, JSON.stringify(scoreCalculationRequest));
	}

	private async consumeTargetCreated(message: TargetCreatedMessage) {
		const createArgs: CreateArgs = {
			customId: message.data.customId,
			userId: message.data.userId
		};
		try {
			void ServicesRegistry.getInstance().targetRepository.create(createArgs);
		} catch (e) {
			console.error("Error while creating target.", e);
		}
	}

	private async consumeUserCreated(message: UserCreatedMessage) {
		try {
			void ServicesRegistry.getInstance().userRepository.create({ customId: message.data.customId });
		} catch (e) {
			console.error("Error while creating a user.", e);
		}
	}

	private async consumeTargetDeleted(message: TargetDeletedMessage) {
		try {
			await void ServicesRegistry.getInstance().targetRepository.deleteById(message.data.customId);
		} catch (e) {
			console.error("Error while deleting target.", e);
		}
	}

	private submissionServiceCallbackQueueListener(msg: ConsumeMessage) {
		const channel = this._messageBroker.channel;
		if (!channel) {
			return;
		}

		// The id of the requested target.
		const correlationId = msg.properties.correlationId;
		if (!correlationId) {
			channel.reject(msg, false);

			console.warn("Message received from the message broker didn't include a correlationId.");
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

		const messageParsed = targetRpcResponseSchema.safeParse(messageObject);

		// If the message has the correct format.
		if (messageParsed.success) {
			channel.ack(msg);
			void this.consumeRpcTargetResponse(correlationId, messageParsed.data);
			return;
		}

		channel.reject(msg, false);
	}

	private async consumeScoreCalculationResponse(message: ScoreCalculationResponseMessage) {
		let submissionInDatabase: SubmissionPersistent | null;
		try {
			submissionInDatabase = await ServicesRegistry.getInstance().submissionRepository.get(message.data.submission.customId);
		} catch (e) {
			console.error("Error while getting a submission.", e);
			return;
		}

		if (!submissionInDatabase) {
			console.warn("The submission id that was received as score calculation response wasn't found in the database.");
			return;
		}

		submissionInDatabase.score = message.data.submission.score;
		void submissionInDatabase.save();
	}
}
