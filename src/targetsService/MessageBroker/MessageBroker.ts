import { IMessageBrokerTargetProcessed, IMessageBrokerUser, IMessageBrokerUserCreatedConsumer } from "@/shared/MessageBroker/MessageBroker.js";
import { Channel, Connection, Replies } from "amqplib";
import { exchangeAlphaParams, exchangeCharlieParams, exchangeDeltaParams, targetsServicesTargetsProcessedQueueParams, targetsServicesUsersCreatedQueueParams } from "@/shared/MessageBroker/constants.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";

export class TargetsServiceMessageBroker implements IMessageBrokerUserCreatedConsumer, IMessageBrokerTargetProcessed {
	private _messageBrokerUser: IMessageBrokerUser;
	private _exchangeAlpha: Replies.AssertExchange | undefined;
	private _exchangeCharlie: Replies.AssertExchange | undefined;
	private _exchangeDelta: Replies.AssertExchange | undefined;
	private _targetsProcessedQueue: Replies.AssertQueue | undefined;
	private _usersQueue: Replies.AssertQueue | undefined;

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
		this.exchangeAlpha = await this.channel?.assertExchange(...exchangeAlphaParams);
		this.exchangeCharlie = await this.channel?.assertExchange(...exchangeCharlieParams);
		this.exchangeDelta = await this.channel?.assertExchange(...exchangeDeltaParams);

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

				await this.channel.bindQueue(this.usersQueue.queue, this.exchangeDelta.exchange, <RoutingKey> "#");
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

				await this.channel.bindQueue(this.targetsProcessedQueue.queue, this.exchangeCharlie.exchange, <RoutingKey> "submissions.image.processed");
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
}
