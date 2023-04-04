import amqp, { Channel, Connection, Replies } from "amqplib";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";

export interface IMessageBrokerUser {
	connection: Connection | undefined;
	channel: Channel | undefined;

	connect(url: string): Promise<Connection | undefined>;

	createChannel(): Promise<Channel | undefined>;

	publish(routingKey: RoutingKey, msg: string): boolean;
}

export interface IAssertsExchanges extends IMessageBrokerUser {
	assertExchanges(): Promise<boolean>;
}

export interface IHasExchangeAlpha extends IMessageBrokerUser, IAssertsExchanges {
	exchangeAlpha: Replies.AssertExchange | undefined;
}

export interface IHasExchangeBeta extends IMessageBrokerUser, IAssertsExchanges {
	exchangeBeta: Replies.AssertExchange | undefined;
}

export interface IHasExchangeCharlie extends IMessageBrokerUser, IAssertsExchanges {
	exchangeCharlie: Replies.AssertExchange | undefined;
}

export interface IHasExchangeDelta extends IMessageBrokerUser, IAssertsExchanges {
	exchangeCharlie: Replies.AssertExchange | undefined;
}

export interface IMessageBrokerUserCreatedPublisher extends IHasExchangeAlpha {
}

export interface IMessageBrokerUserCreatedConsumer extends IMessageBrokerUser, IHasExchangeAlpha, IHasExchangeBeta {
	usersQueue: Replies.AssertQueue | undefined;
}

export interface IMessageBrokerTargetProcessed extends IMessageBrokerUser, IHasExchangeAlpha, IHasExchangeCharlie {
	usersQueue: Replies.AssertQueue | undefined;
	targetsProcessedQueue: Replies.AssertQueue | undefined;
}

export interface IMessageBrokerTargetCreated extends IMessageBrokerUser, IHasExchangeAlpha, IHasExchangeBeta {
	usersQueue: Replies.AssertQueue | undefined;
	targetsProcessedQueue: Replies.AssertQueue | undefined;
}
