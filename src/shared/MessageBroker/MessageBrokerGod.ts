import { IAssertsExchanges, IAssertsQueues, IHasExchangeAlpha, IHasExchangeBravo, IHasExchangeCharlie, IMessageBrokerUser, IMessagePublisher } from "@/shared/MessageBroker/MessageBroker.js";
import { Channel, Connection, Replies } from "amqplib";
import { exchangeAlphaName, ExchangeName, imagesToProcessQueueName, imagesToProcessQueueParams, submissionServiceCallbackQueueName, submissionServiceCallbackQueueParams, submissionsServicesQueueName, submissionsServicesQueueParams, targetsServiceQueueParams, targetsServiceRpcQueueName, targetsServiceRpcQueueParams, targetsServicesQueueName } from "@/shared/MessageBroker/constants.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { BindExchange_A_B, BindExchange_A_C, ExchangeAlphaAsserter, ExchangeBravoAsserter, ExchangeCharlieAsserter, MessageBrokerUser } from "@/shared/MessageBroker/helperClasses.js";
import { Options } from "amqplib/properties.js";

export class MessageBroker implements IMessageBrokerUser, IMessagePublisher, IAssertsExchanges, IAssertsQueues, IHasExchangeAlpha, IHasExchangeBravo, IHasExchangeCharlie {
	public targetsServiceQueue: Replies.AssertQueue | undefined;
	public submissionsServiceQueue: Replies.AssertQueue | undefined;
	public targetsServiceRpcQueue: Replies.AssertQueue | undefined;
	public submissionServiceCallbackQueue: Replies.AssertQueue | undefined;
	public imagesToProcessQueue: Replies.AssertQueue | undefined;
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
				console.error(`Asserting queue "${targetsServicesQueueName}" failed. Exchange bravo was not found.`);
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
				console.error(`Asserting queue "${submissionsServicesQueueName}" failed. Exchange bravo was not found.`);
				return false;
			}

			const exchangeCharlie = this._exchangeCharlieAsserter.exchangeCharlie;
			if (!exchangeCharlie) {
				console.error(`Asserting queue "${submissionsServicesQueueName}" failed. Exchange charlie was not found.`);
				return false;
			}

			this.submissionsServiceQueue = await channel.assertQueue(...submissionsServicesQueueParams);

			const pattern1: RoutingKey = "submissions.image.scoreCalculated";
			await channel.bindQueue(this.submissionsServiceQueue.queue, exchangeCharlie.exchange, pattern1);

			const pattern2: RoutingKey = "users.*.created";
			await channel.bindQueue(this.submissionsServiceQueue.queue, exchangeBravo.exchange, pattern2);

			const pattern3: RoutingKey = "targets.*.created";
			await channel.bindQueue(this.submissionsServiceQueue.queue, exchangeBravo.exchange, pattern3);

			const pattern4: RoutingKey = "targets.*.deleted";
			await channel.bindQueue(this.submissionsServiceQueue.queue, exchangeBravo.exchange, pattern4);

			return true;
		} catch (e) {
			console.error(`Asserting queue "${submissionsServicesQueueName}" failed: `);
			console.error(e);

			return false;
		}
	}

	public async setupTargetsServiceRpcQueue(): Promise<boolean> {
		try {
			const channel = this._messageBrokerUser.channel;
			if (!channel) {
				console.error(`Asserting queue "${targetsServiceRpcQueueName}" failed. No channel found.`);
				return false;
			}

			this.targetsServiceRpcQueue = await channel.assertQueue(...targetsServiceRpcQueueParams);
			// TODO: Is it needed to set the prefetch to 1?

			return true;
		} catch (e) {
			console.error(`Asserting queue "${targetsServiceRpcQueueName}" failed: `);
			console.error(e);

			return false;
		}
	}

	public async setupSubmissionServiceCallbackQueue(): Promise<boolean> {
		try {
			const channel = this._messageBrokerUser.channel;
			if (!channel) {
				console.error(`Asserting queue "${submissionServiceCallbackQueueName}" failed. No channel found.`);
				return false;
			}

			this.submissionServiceCallbackQueue = await channel.assertQueue(...submissionServiceCallbackQueueParams);

			return true;
		} catch (e) {
			console.error(`Asserting queue "${submissionServiceCallbackQueueName}" failed: `);
			console.error(e);

			return false;
		}
	}

	public async setupImagesToProcessQueue(): Promise<boolean> {
		try {
			const channel = this._messageBrokerUser.channel;
			if (!channel) {
				console.error(`Asserting queue "${imagesToProcessQueueName}" failed. No channel found.`);
				return false;
			}

			const exchangeBravo = this._exchangeBravoAsserter.exchangeBravo;
			if (!exchangeBravo) {
				console.error(`Asserting queue "${imagesToProcessQueueName}" failed. Exchange bravo was not found.`);
				return false;
			}

			this.imagesToProcessQueue = await channel.assertQueue(...imagesToProcessQueueParams);

			const pattern1: RoutingKey = "*.image.scoreCalculationRequested";
			await channel.bindQueue(this.imagesToProcessQueue.queue, exchangeBravo.exchange, pattern1);

			return true;
		} catch (e) {
			console.error(`Asserting queue "${imagesToProcessQueueName}" failed: `);
			console.error(e);

			return false;
		}
	}

	public async setupQueues(): Promise<boolean> {
		await this.setupTargetsServiceQueue();
		await this.setupSubmissionsServiceQueue();
		await this.setupTargetsServiceRpcQueue();
		await this.setupSubmissionServiceCallbackQueue();
		await this.setupImagesToProcessQueue();

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

	public publishToQueue(queueName: string, msg: string, options: Options.Publish = {}): boolean {
		return this._messageBrokerUser.publishToQueue(queueName, msg, options);
	}
}
