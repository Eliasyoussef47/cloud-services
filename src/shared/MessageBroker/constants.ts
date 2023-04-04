import { Channel } from "amqplib";

export const exchangeAlphaName = "alpha";
export const exchangeBravoName = "bravo";
export const exchangeCharlieName = "charlie";
export const exchangeDeltaName = "delta";

export type ExchangeName = typeof exchangeAlphaName | typeof exchangeBravoName | typeof exchangeCharlieName | typeof exchangeDeltaName;

export type AssertExchangeParams = Parameters<Channel["assertExchange"]>

export const exchangeAlphaParams: AssertExchangeParams = [exchangeAlphaName, "topic", { durable: true }];
export const exchangeBravoParams: AssertExchangeParams = [exchangeBravoName, "fanout", { durable: true }];
export const exchangeCharlieParams: AssertExchangeParams = [exchangeCharlieName, "fanout", { durable: true }];
export const exchangeDeltaParams: AssertExchangeParams = [exchangeDeltaName, "fanout", { durable: true }];

export const targetsServicesUsersCreatedQueueName = "targetsService.users.created";
export const targetsServicesTargetsProcessedQueueName = "targetsService.targets.processed";

export type AssertQueueParams = Parameters<Channel["assertQueue"]>

export const targetsServicesUsersCreatedQueueParams: AssertQueueParams = [targetsServicesUsersCreatedQueueName, { durable: true }];
export const targetsServicesTargetsProcessedQueueParams: AssertQueueParams = [targetsServicesTargetsProcessedQueueName, { durable: true }];
