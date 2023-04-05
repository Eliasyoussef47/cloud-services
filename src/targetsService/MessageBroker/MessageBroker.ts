import { IMessageBrokerTargetProcessed, IMessageBrokerUser, IMessageBrokerUserCreatedConsumer } from "@/shared/MessageBroker/MessageBroker.js";
import { Channel, Connection, ConsumeMessage, Replies } from "amqplib";
import { exchangeAlphaParams, exchangeCharlieParams, exchangeDeltaParams, targetsServicesTargetsProcessedQueueParams, targetsServicesUsersCreatedQueueParams } from "@/shared/MessageBroker/constants.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { UserCreatedMessage, userCreatedMessageSchema } from "@/shared/MessageBroker/messages.js";
import ServicesRegistry from "@/targetsService/ServiceRegistry.js";
import { BindExchange_A_C, BindExchange_A_D } from "@/shared/MessageBroker/helperClasses.js";

export class TargetsServiceMessageBroker implements IMessageBrokerUserCreatedConsumer, IMessageBrokerTargetProcessed {
	private _messageBrokerUser: IMessageBrokerUser;
	private _exchangeAlpha: Replies.AssertExchange | undefined;
	private _exchangeCharlie: Replies.AssertExchange | undefined;
	private _exchangeDelta: Replies.AssertExchange | undefined;
	private _targetsProcessedQueue: Replies.AssertQueue | undefined;
	private _usersQueue: Replies.AssertQueue | undefined;
	private _bindExchange_A_D: BindExchange_A_D | undefined;
	private _bindExchange_A_C: BindExchange_A_C | undefined;

	constructor(messageBrokerUser: IMessageBrokerUser) {
		this._messageBrokerUser = messageBrokerUser;
	}

	public get usersQueue(): Replies.AssertQueue | undefined {
		return this._usersQueue;
	}

	public set usersQueue(value: Replies.AssertQueue | undefined) {
		this._usersQueue = value;
	}

	public get targetsProcessedQueue(): Replies.AssertQueue | undefined {
		return this._targetsProcessedQueue;
	}

	public set targetsProcessedQueue(value: Replies.AssertQueue | undefined) {
		this._targetsProcessedQueue = value;
	}

	public get exchangeCharlie(): Replies.AssertExchange | undefined {
		return this._exchangeCharlie;
	}

	public set exchangeCharlie(value: Replies.AssertExchange | undefined) {
		this._exchangeCharlie = value;
	}

	public get exchangeAlpha(): Replies.AssertExchange | undefined {
		return this._exchangeAlpha;
	}

	public set exchangeAlpha(value: Replies.AssertExchange | undefined) {
		this._exchangeAlpha = value;
	}

	public get exchangeDelta(): Replies.AssertExchange | undefined {
		return this._exchangeDelta;
	}

	public set exchangeDelta(value: Replies.AssertExchange | undefined) {
		this._exchangeDelta = value;
	}

	public get connection(): Connection | undefined {
		return this._messageBrokerUser.connection;
	}

	public set connection(value: Connection | undefined) {
		this._messageBrokerUser.connection = value;
	}

	public get channel(): Channel | undefined {
		return this._messageBrokerUser.channel;
	}

	public set channel(value: Channel | undefined) {
		this._messageBrokerUser.channel = value;
	}

	public async connect(url: string): Promise<Connection | undefined> {
		return await this._messageBrokerUser.connect(url);
	}

	public async createChannel(): Promise<Channel | undefined> {
		return await this._messageBrokerUser.createChannel();
	}

	public async assertExchanges(): Promise<boolean> {
		if (!this.channel) {
			return false;
		}

		this.exchangeAlpha = await this.channel?.assertExchange(...exchangeAlphaParams);
		this.exchangeCharlie = await this.channel?.assertExchange(...exchangeCharlieParams);
		this.exchangeDelta = await this.channel?.assertExchange(...exchangeDeltaParams);
		if (!this.exchangeAlpha || !this.exchangeCharlie || !this.exchangeDelta) {
			return false;
		}

		this._bindExchange_A_D = new BindExchange_A_D(this.channel, this.exchangeAlpha, this.exchangeDelta);
		await this._bindExchange_A_D.assertExchanges();

		this._bindExchange_A_C = new BindExchange_A_C(this.channel, this.exchangeAlpha, this.exchangeCharlie);
		await this._bindExchange_A_C.assertExchanges();

		return true;
	}

	public async setupQueues(): Promise<boolean> {
		const setupTargetsServicesUsersCreatedQueue = async () => {
			try {
				if (!this.channel) {
					return;
				}

				this.usersQueue = await this.channel?.assertQueue(...targetsServicesUsersCreatedQueueParams);

				if (!this.exchangeDelta || !this.usersQueue) {
					return;
				}

				await this.channel.bindQueue(this.usersQueue.queue, this.exchangeDelta.exchange, <RoutingKey> "");
			} catch (e) {
				this.usersQueue = undefined;
			}
		}

		const setupTargetsServicesTargetsProcessedQueue = async () => {
			try {
				if (!this.channel) {
					return;
				}

				this.targetsProcessedQueue = await this.channel?.assertQueue(...targetsServicesTargetsProcessedQueueParams);

				if (!this.exchangeCharlie || !this.targetsProcessedQueue) {
					return;
				}

				await this.channel.bindQueue(this.targetsProcessedQueue.queue, this.exchangeCharlie.exchange, <RoutingKey> "targets.image.processed");
			} catch (e) {
				this.usersQueue = undefined;
			}
		}

		await setupTargetsServicesUsersCreatedQueue.call(this);
		await setupTargetsServicesTargetsProcessedQueue.call(this);

		// TODO: Return real value.
		return true;
	}

	public publish(routingKey: RoutingKey, msg: string, exchange: string = "alpha"): boolean {
		return this._messageBrokerUser.publish(routingKey, msg);
	}

	private async consumeUserCreated(message: UserCreatedMessage) {
		await ServicesRegistry.getInstance().userRepository.create({ customId: message.data.customId });
	}

	public async userCreatedListener(msg: ConsumeMessage | null) {
		if (!msg) {
			return;
		}

		const channel = this.channel;
		if (!channel) {
			return;
		}

		const messageObject = JSON.parse(msg.content.toString());
		const parsedMessage = userCreatedMessageSchema.safeParse(messageObject);

		if (!parsedMessage.success) {
			return;
		}

		channel.ack(msg);
		await this.consumeUserCreated(parsedMessage.data);
	}

	public async consume(): Promise<void> {
		try {
			const channel = this.channel;
			if (!channel) {
				return;
			}

			const usersQueue = this.usersQueue;
			if (!usersQueue) {
				return;
			}

			channel.consume(usersQueue.queue, (msg) => this.userCreatedListener(msg)).then();

		} catch (error) {
			console.log (`Error in consume: ${error}`);
		}
	}
}
