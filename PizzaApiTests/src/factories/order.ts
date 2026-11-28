import {faker} from '@faker-js/faker';
import type {OrderAddress} from '@/data/OrderAddress';
import type {OrderItem} from '@/data/OrderItem';

export function makeOrderAddress(
    overrides: Partial<OrderAddress> = {},
): OrderAddress {
    return {
        city: faker.location.city(),
        street: faker.location.street(),
        house: faker.location.buildingNumber(),
        postcode: faker.string.numeric(3),
        ...overrides,
    };
}

export function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
    return {
        name: faker.helpers.arrayElement(['Chicken BBQ', 'Margherita', 'Pepperoni', 'Pineapple Pizza']),
        size: 'MEDIUM',
        qty: faker.number.int({min: 1, max: 10}),
        ...overrides,
    };
}