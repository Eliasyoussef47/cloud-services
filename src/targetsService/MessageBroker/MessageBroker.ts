import { ConsumeMessage } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { TargetCreatedBody, TargetCreatedMessage, UserCreatedMessage, userCreatedMessageSchema } from "@/shared/MessageBroker/messages.js";
import ServicesRegistry from "@/targetsService/ServiceRegistry.js";
import { MessageBroker } from "@/shared/MessageBroker/helperClasses.js";
import { exchangeAlphaName, ExchangeName } from "@/shared/MessageBroker/constants.js";

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
		void this.consume();
	}

	public publish(routingKey: RoutingKey, msg: string, exchange: ExchangeName = exchangeAlphaName): boolean {
		return this._messageBroker.publish(routingKey, msg, exchange);
	}

	// TODO: Filter consumed messages.
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

	private async consumeUserCreated(message: UserCreatedMessage) {
		await ServicesRegistry.getInstance().userRepository.create({ customId: message.data.customId });
	}

	private publishTargetCreatedBase(message: TargetCreatedMessage): boolean {
		return this.publish("targets.*.created", JSON.stringify(message));
	}
}
