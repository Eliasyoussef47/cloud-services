import { IAssertsExchanges, IAssertsQueues, IHasExchangeAlpha, IHasExchangeBravo, IHasExchangeCharlie, IMessageBrokerUser, IMessagePublisher } from "@/shared/MessageBroker/MessageBroker.js";
import amqp, { Channel, Connection, Replies } from "amqplib";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { exchangeAlphaName, exchangeAlphaParams, exchangeBravoName, exchangeBravoParams, exchangeCharlieName, exchangeCharlieParams, ExchangeName, submissionsServicesQueueName, submissionsServicesQueueParams, targetsServiceQueueParams, targetsServicesQueueName } from "@/shared/MessageBroker/constants.js";

export class MessageBrokerUser implements IMessageBrokerUser, IMessagePublisher {
	public connection: Connection | undefined;
	public channel: Channel | undefined;

	public async connect(url: string): Promise<Connection | undefined> {
		this.connection = await amqp.connect(url);
		return this.connection;
	}

	public async createChannel(): Promise<Channel | undefined> {
		if (!this.connection) {
			throw new CustomError("Message broker connection has not been established");
		}

		try {
			this.channel = await this.connection.createChannel();
		} catch (e) {
			console.log("Failed to create message broker channel.");
		}
		return this.channel;
	}

	public publish(routingKey: RoutingKey, msg: string, exchange: ExchangeName = exchangeAlphaName): boolean {
		try {
			const channel = this.channel;
			if (!channel) {
				return false;
				// throw new CustomError("Channel not constructed.");
			}

			// Messages are persistent so they are written to disk. This ensures that messages are not lost after system restart.
			return channel.publish(exchange, routingKey, Buffer.from(msg), { persistent: true });
		} catch (error) {
			console.log("Error while publishing : " + error);
			return false;
		}
	}
}

export class ExchangeAlphaAsserter implements IHasExchangeAlpha, IAssertsExchanges {
	public exchangeAlpha: Replies.AssertExchange | undefined;
	private _brokerUser: IMessageBrokerUser;

	constructor(channel: IMessageBrokerUser) {
		this._brokerUser = channel;
	}

	public async assertExchanges(): Promise<boolean> {
		try {
			const channel = this._brokerUser.channel;
			if (!channel) {
				console.error(`Asserting exchange "${exchangeAlphaName}" failed. No channel found.`);
				return false;
			}
			if (this.exchangeAlpha) {
				console.error(`Asserting exchange "${exchangeAlphaName}" failed. Exchange has already been asserted.`);
				return false;
			}

			this.exchangeAlpha = await channel.assertExchange(...exchangeAlphaParams);

			return true;
		} catch (e) {
			console.error(`Asserting exchange "${exchangeAlphaName}" failed: `);
			console.error(e);

			return false;
		}
	}
}

export class ExchangeBravoAsserter implements IHasExchangeBravo, IAssertsExchanges {
	public exchangeBravo: Replies.AssertExchange | undefined;
	private _brokerUser: IMessageBrokerUser;

	constructor(brokerUser: IMessageBrokerUser) {
		this._brokerUser = brokerUser;
	}

	public async assertExchanges(): Promise<boolean> {
		try {
			const channel = this._brokerUser.channel;
			if (!channel) {
				console.error(`Asserting exchange "${exchangeBravoName}" failed. No channel found.`);
				return false;
			}
			if (this.exchangeBravo) {
				console.error(`Asserting exchange "${exchangeBravoName}" failed. Exchange has already been asserted.`);
				return false;
			}

			this.exchangeBravo = await channel.assertExchange(...exchangeBravoParams);

			return true;
		} catch (e) {
			console.error(`Asserting exchange "${exchangeBravoName}" failed: `);
			console.error(e);

			return false;
		}
	}
}

export class ExchangeCharlieAsserter implements IHasExchangeCharlie, IAssertsExchanges {
	public exchangeCharlie: Replies.AssertExchange | undefined;
	private _brokerUser: IMessageBrokerUser;

	constructor(brokerUser: IMessageBrokerUser) {
		this._brokerUser = brokerUser;
	}

	public async assertExchanges(): Promise<boolean> {
		try {
			const channel = this._brokerUser.channel;
			if (!channel) {
				console.error(`Asserting exchange "${exchangeCharlieName}" failed. No channel found.`);
				return false;
			}
			if (this.exchangeCharlie) {
				console.error(`Asserting exchange "${exchangeCharlieName}" failed. Exchange has already been asserted.`);
				return false;
			}

			this.exchangeCharlie = await channel.assertExchange(...exchangeCharlieParams);

			return true;
		} catch (e) {
			console.error(`Asserting exchange "${exchangeCharlieName}" failed: `);
			console.error(e);

			return false;
		}
	}
}

export class BindExchange_A_B implements IHasExchangeAlpha, IHasExchangeBravo {
	public hasExchangeAlpha: IHasExchangeAlpha;
	public hasExchangeBravo: IHasExchangeBravo;
	private readonly messageBrokerUser: IMessageBrokerUser;

	constructor(messageBrokerUser: IMessageBrokerUser, hasExchangeAlpha: IHasExchangeAlpha, hasExchangeBravo: IHasExchangeBravo) {
		this.messageBrokerUser = messageBrokerUser;
		this.hasExchangeAlpha = hasExchangeAlpha;
		this.hasExchangeBravo = hasExchangeBravo;
	}

	public get exchangeBravo(): Replies.AssertExchange | undefined {
		return this.hasExchangeBravo.exchangeBravo;
	}

	public set exchangeBravo(value: Replies.AssertExchange | undefined) {
		this.hasExchangeBravo.exchangeBravo = value;
	}

	public get exchangeAlpha(): Replies.AssertExchange | undefined {
		return this.hasExchangeAlpha.exchangeAlpha;
	}

	public set exchangeAlpha(value: Replies.AssertExchange | undefined) {
		this.hasExchangeAlpha.exchangeAlpha = value;
	}

	public async bindExchanges(): Promise<boolean> {
		try {
			const channel = this.messageBrokerUser.channel;
			if (!channel) {
				console.error(`Binding exchange "${exchangeAlphaName}" with exchange "${exchangeBravoName}" failed. No channel found.`);
				return false;
			}

			const exchangeAlpha = this.hasExchangeAlpha.exchangeAlpha;
			const exchangeBravo = this.hasExchangeBravo.exchangeBravo;

			if (!exchangeAlpha || !exchangeBravo) {
				console.error(`Binding exchange "${exchangeAlphaName}" with exchange "${exchangeBravoName}" failed. One of the exchanges was not found.`);
				return false;
			}

			const pattern1: RoutingKey = "*.*.created";
			await channel.bindExchange(exchangeBravo.exchange, exchangeAlpha.exchange, pattern1);

			const pattern2: RoutingKey = "*.image.created";
			await channel.bindExchange(exchangeBravo.exchange, exchangeAlpha.exchange, pattern2);

			return true;
		} catch (e) {
			return false;
		}
	}
}

export class BindExchange_A_C implements IHasExchangeAlpha, IHasExchangeCharlie {
	public hasExchangeAlpha: IHasExchangeAlpha;
	public hasExchangeCharlie: IHasExchangeCharlie;
	private readonly _messageBrokerUser: IMessageBrokerUser;

	constructor(messageBrokerUser: IMessageBrokerUser, hasExchangeAlpha: IHasExchangeAlpha, hasExchangeCharlie: IHasExchangeCharlie) {
		this._messageBrokerUser = messageBrokerUser;
		this.hasExchangeAlpha = hasExchangeAlpha;
		this.hasExchangeCharlie = hasExchangeCharlie;
	}

	public get exchangeCharlie(): Replies.AssertExchange | undefined {
		return this.hasExchangeCharlie.exchangeCharlie;
	}

	public set exchangeCharlie(value: Replies.AssertExchange | undefined) {
		this.hasExchangeCharlie.exchangeCharlie = value;
	}

	public get exchangeAlpha(): Replies.AssertExchange | undefined {
		return this.hasExchangeAlpha.exchangeAlpha;
	}

	public set exchangeAlpha(value: Replies.AssertExchange | undefined) {
		this.hasExchangeAlpha.exchangeAlpha = value;
	}

	public async bindExchanges(): Promise<boolean> {
		try {
			const channel = this._messageBrokerUser.channel;
			if (!channel) {
				console.error(`Binding exchange "${exchangeAlphaName}" with exchange "${exchangeCharlieName}" failed. No channel found.`);
				return false;
			}

			const exchangeAlpha = this.hasExchangeAlpha.exchangeAlpha;
			const exchangeCharlie = this.hasExchangeCharlie.exchangeCharlie;

			if (!exchangeAlpha || !exchangeCharlie) {
				console.error(`Binding exchange "${exchangeAlphaName}" with exchange "${exchangeCharlieName}" failed. One of the exchanges was not found.`);
				return false;
			}

			const pattern: RoutingKey = "submissions.image.scoreCalculated";
			await channel.bindExchange(exchangeCharlie.exchange, exchangeAlpha.exchange, pattern);

			return true;
		} catch (e) {
			return false;
		}
	}
}

export class MessageBroker implements IMessageBrokerUser, IMessagePublisher, IAssertsExchanges, IAssertsQueues, IHasExchangeAlpha, IHasExchangeBravo, IHasExchangeCharlie {
	public targetsServiceQueue: Replies.AssertQueue | undefined;
	public submissionsServiceQueue: Replies.AssertQueue | undefined;
	private readonly _messageBrokerUser: MessageBrokerUser;
	private _exchangeAlphaAsserter: ExchangeAlphaAsserter;
	private _exchangeBravoAsserter: ExchangeBravoAsserter;
	private _exchangeCharlieAsserter: ExchangeCharlieAsserter;
	private _bindExchange_A_B: BindExchange_A_B;
	private _bindExchange_A_C: BindExchange_A_C;

	constructor() {
		this._messageBrokerUser = new MessageBrokerUser();
		this._exchangeAlphaAsserter = new ExchangeAlphaAsserter(this._messageBrokerUser);
		this._exchangeBravoAsserter = new ExchangeBravoAsserter(this._messageBrokerUser);
		this._exchangeCharlieAsserter = new ExchangeCharlieAsserter(this._messageBrokerUser);
		this._bindExchange_A_B = new BindExchange_A_B(this, this, this);
		this._bindExchange_A_C = new BindExchange_A_C(this, this, this);
	}

	public get exchangeAlpha(): Replies.AssertExchange | undefined {
		return this._exchangeAlphaAsserter.exchangeAlpha;
	}

	public set exchangeAlpha(value: Replies.AssertExchange | undefined) {
		this._exchangeAlphaAsserter.exchangeAlpha = value;
	}

	public get exchangeBravo(): Replies.AssertExchange | undefined {
		return this._exchangeBravoAsserter.exchangeBravo;
	}

	public set exchangeBravo(value: Replies.AssertExchange | undefined) {
		this._exchangeBravoAsserter.exchangeBravo = value;
	}

	public get exchangeCharlie(): Replies.AssertExchange | undefined {
		return this._exchangeCharlieAsserter.exchangeCharlie;
	}

	public set exchangeCharlie(value: Replies.AssertExchange | undefined) {
		this._exchangeCharlieAsserter.exchangeCharlie = value;
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

	public async assertExchangeAlpha(): Promise<boolean> {
		await this._exchangeAlphaAsserter.assertExchanges();

		return true;
	}

	public async assertExchangeBravo(): Promise<boolean> {
		await this._exchangeBravoAsserter.assertExchanges();

		return true;
	}

	public async assertExchangeCharlie(): Promise<boolean> {
		await this._exchangeCharlieAsserter.assertExchanges();

		return true;
	}

	public async assertExchanges(): Promise<boolean> {
		await this.assertExchangeAlpha();
		await this.assertExchangeBravo();
		await this.assertExchangeCharlie();

		return true;
	}

	public async bindExchange_A_B() {
		await this._bindExchange_A_B.bindExchanges();
	}

	public async bindExchange_A_C() {
		await this._bindExchange_A_C.bindExchanges();
	}

	public async bindExchanges() {
		await this.bindExchange_A_B();
		await this.bindExchange_A_C();
	}

	public async setupTargetsServiceQueue(): Promise<boolean> {
		try {
			const channel = this._messageBrokerUser.channel;
			if (!channel) {
				console.error(`Asserting queue "${targetsServicesQueueName}" failed. No channel found.`);
				return false;
			}

			const exchangeBravo = this._exchangeBravoAsserter.exchangeBravo;
			if (!exchangeBravo) {
				console.error(`Asserting queue "${targetsServicesQueueName}" failed. Exchange bravo was not found..`);
				return false;
			}

			this.targetsServiceQueue = await channel.assertQueue(...targetsServiceQueueParams);
			const pattern1: RoutingKey = "targets.image.uploaded";
			await channel.bindQueue(this.targetsServiceQueue.queue, exchangeBravo.exchange, pattern1);

			const pattern2: RoutingKey = "users.*.created";
			await channel.bindQueue(this.targetsServiceQueue.queue, exchangeBravo.exchange, pattern2);

			return true;
		} catch (e) {
			console.error(`Asserting queue "${targetsServicesQueueName}" failed: `);
			console.error(e);

			return false;
		}
	}

	public async setupSubmissionsServiceQueue(): Promise<boolean> {
		try {
			const channel = this._messageBrokerUser.channel;
			if (!channel) {
				console.error(`Asserting queue "${submissionsServicesQueueName}" failed. No channel found.`);
				return false;
			}

			const exchangeBravo = this._exchangeBravoAsserter.exchangeBravo;
			if (!exchangeBravo) {
				console.error(`Asserting queue "${submissionsServicesQueueName}" failed. Exchange bravo was not found..`);
				return false;
			}

			this.submissionsServiceQueue = await channel.assertQueue(...submissionsServicesQueueParams);

			const pattern1: RoutingKey = "submissions.image.uploaded";
			await channel.bindQueue(this.submissionsServiceQueue.queue, exchangeBravo.exchange, pattern1);

			const pattern2: RoutingKey = "users.*.created";
			await channel.bindQueue(this.submissionsServiceQueue.queue, exchangeBravo.exchange, pattern2);

			const pattern3: RoutingKey = "targets.*.created";
			await channel.bindQueue(this.submissionsServiceQueue.queue, exchangeBravo.exchange, pattern3);

			return true;
		} catch (e) {
			console.error(`Asserting queue "${submissionsServicesQueueName}" failed: `);
			console.error(e);

			return false;
		}
	}

	// TODO: Add RPC queues.
	public async setupQueues(): Promise<boolean> {
		await this.setupTargetsServiceQueue();
		await this.setupSubmissionsServiceQueue();

		return true;
	}

	public async setup() {
		await this.assertExchanges();
		await this.bindExchanges();
		await this.setupQueues();
	}

	public publish(routingKey: RoutingKey, msg: string, exchange: ExchangeName = exchangeAlphaName): boolean {
		return this._messageBrokerUser.publish(routingKey, msg, exchange);
	}
}
