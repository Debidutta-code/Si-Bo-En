import BullMQHelper from './bull-mq.helper';

let _instance: BullMQHelper | null = null;

export function initBullMQHelper(connection: any): BullMQHelper {
    if (!_instance) {
        _instance = new BullMQHelper('currency-exchange-queue', connection);
    }
    return _instance;
}

export function getBullMQHelper(): BullMQHelper {
    if (!_instance) {
        throw new Error('BullMQHelper has not been initialized yet. Call initBullMQHelper() first.');
    }
    return _instance;
}
