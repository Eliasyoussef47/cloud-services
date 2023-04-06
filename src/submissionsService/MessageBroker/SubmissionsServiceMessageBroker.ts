import { ConsumeMessage } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { messageBrokerMessageBaseSchema, TargetCreatedMessage, targetCreatedMessageSchema, UserCreatedMessage, userCreatedMessageSchema } from "@/shared/MessageBroker/messages.js";
import { exchangeAlphaName, ExchangeName } from "@/shared/MessageBroker/constants.js";
import ServicesRegistry from "@/submissionsService/ServiceRegistry.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";

export class SubmissionsServiceMessageBroker {
	private _messageBroker: MessageBroker;

	constructor(messageBroker: MessageBroker) {
		this._messageBroker = messageBroker;
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

			const submissionsServiceQueue = this._messageBroker.submissionsServiceQueue;
			if (!submissionsServiceQueue) {
				return;
			}

			channel.consume(submissionsServiceQueue.queue, (msg) => {
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

	public async submissionsServiceQueueListener(msg: ConsumeMessage | null): Promise<void> {
		if (!msg) {
			return;
		}

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
			channel.ack(msg);
			void this.consumeTargetCreated(parsedMessageTargetCreated.data);
			return;
		}

		// Test if the message is about a newly created user.
		const parsedMessageUserCreated = userCreatedMessageSchema.safeParse(messageParsed.data);
		if (parsedMessageUserCreated.success) {
			channel.ack(msg);
			void this.consumeUserCreated(parsedMessageUserCreated.data);
			return;
		}

		channel.reject(msg, false);
		console.warn("Message received from the message broker was unprocessable.");
	}

	private async consumeTargetCreated(message: TargetCreatedMessage) {
		void ServicesRegistry.getInstance().targetRepository.create({ customId: message.data.customId });
	}

	private async consumeUserCreated(message: UserCreatedMessage) {
		void ServicesRegistry.getInstance().userRepository.create({ customId: message.data.customId });
	}

	private submissionServiceCallbackQueueListener(msg: ConsumeMessage) {
		// TODO: Validate message.
		// TODO: Setup message.
		// TODO: Send message so that it goes to the images service.

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
	}
}
