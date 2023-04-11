import { ConsumeMessage } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { TargetCreatedBody, TargetCreatedMessage, TargetDeletedBody, TargetDeletedMessage, UserCreatedMessage, userCreatedMessageSchema } from "@/shared/MessageBroker/messages.js";
import ServicesRegistry from "@/targetsService/ServiceRegistry.js";
import { exchangeAlphaName, ExchangeName } from "@/shared/MessageBroker/constants.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { TargetRpcRequest, targetRpcRequestSchema, TargetRpcResponse } from "@/shared/types/rpc/index.js";
import { Options } from "amqplib/properties.js";
import { TargetPersistent } from "@/targetsService/persistence/ITargetRepository.js";

export class TargetsServiceMessageBroker {
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

	public publish(routingKey: RoutingKey, msg: string, exchange: ExchangeName = exchangeAlphaName): boolean {
		return this._messageBroker.publish(routingKey, msg, exchange);
	}

	public async consume(): Promise<void> {
		try {
			const channel = this._messageBroker.channel;
			if (!channel) {
				return;
			}

			const targetsServiceQueue = this._messageBroker.targetsServiceQueue;
			if (!targetsServiceQueue) {
				return;
			}

			channel.consume(targetsServiceQueue.queue, (msg) => {
				this.userCreatedListener(msg);
			}).then();

			const targetsServiceRpcQueue = this._messageBroker.targetsServiceRpcQueue;
			if (!targetsServiceRpcQueue) {
				return;
			}

			channel.consume(targetsServiceRpcQueue.queue, (msg) => {
				if (!msg) {
					return;
				}
				this.targetsServiceRpcQueueListener(msg);
			}).then();

		} catch (error) {
			console.log(`Error in consume: ${error}`);
		}
	}

	public async userCreatedListener(msg: ConsumeMessage | null) {
		if (!msg) {
			return;
		}

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

		// Validate whether the message is about a newly created user.
		const parsedMessage = userCreatedMessageSchema.safeParse(messageObject);

		if (!parsedMessage.success) {
			// TODO: Maybe reject the message?
			return;
		}

		channel.ack(msg);
		await this.consumeUserCreated(parsedMessage.data);
	}

	public publishTargetCreated(message: TargetCreatedBody): boolean {
		const completeMessage: TargetCreatedMessage = {
			type: "Target",
			status: "created",
			data: message
		};
		return this.publishTargetCreatedBase(completeMessage);
	}

	public publishTargetDeleted(message: TargetDeletedBody): boolean {
		const completeMessage: TargetDeletedMessage = {
			type: "Target",
			status: "deleted",
			data: message
		};
		return this.publishTargetDeletedBase(completeMessage);
	}

	private async consumeUserCreated(message: UserCreatedMessage) {
		try {
			await ServicesRegistry.getInstance().userRepository.create({ customId: message.data.customId });
		} catch (e) {
			console.error("Error while creating a user.", e);
		}
	}

	private publishTargetCreatedBase(message: TargetCreatedMessage): boolean {
		return this.publish("targets.*.created", JSON.stringify(message));
	}

	private publishTargetDeletedBase(message: TargetDeletedMessage) {
		return this.publish("targets.*.deleted", JSON.stringify(message));
	}

	private targetsServiceRpcQueueListener(msg: ConsumeMessage) {
		const channel = this._messageBroker.channel;
		if (!channel) {
			return;
		}

		// The queue we should reply to with the respons.
		const replyTo = msg.properties.replyTo;
		// The id of the requested target
		const correlationId = msg.properties.correlationId;
		if (!replyTo || !correlationId) {
			channel.reject(msg, false);

			console.warn("Message received from the message broker didn't include a replyTo or a correlationId.");
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

		const messageParsed = targetRpcRequestSchema.safeParse(messageObject);

		// If the message has the correct format.
		if (messageParsed.success) {
			channel.ack(msg);
			void this.consumeRpcTargetRequest(replyTo, correlationId, messageParsed.data);
			return;
		}

		// If the message doesn't have the correct format rejects the message (dispose of it).
		channel.reject(msg, false);
		console.warn("Message received from the message broker was unprocessable.");
	}

	private async consumeRpcTargetRequest(replyTo: string, correlationId: string, msg: TargetRpcRequest) {
		let target: TargetPersistent | null = null;
		try {
			target = await ServicesRegistry.getInstance().targetRepository.get(msg.body.submission.targetId);
		} catch (e) {
			console.error("Error while getting a target.", e);
		}

		if (!target) {
			return;
		}

		const rpcResponse: TargetRpcResponse = {
			status: {
				statusCode: 200,
				statusText: "ok"
			},
			body: {
				target: target,
				submission: msg.body.submission
			}
		};

		const messageOptions: Options.Publish = {
			correlationId: correlationId,
		};

		this._messageBroker.publishToQueue(replyTo, JSON.stringify(rpcResponse), messageOptions);
	}
}
