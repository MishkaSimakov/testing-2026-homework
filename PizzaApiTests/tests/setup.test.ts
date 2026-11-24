import {expect, test} from 'vitest';
import {orderResponseSchema} from '@/schemas/order';
import {baseUrl} from "./config";

test('POST /orders creates an order with the documented response schema', async () => {
    const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            address: {
                city: 'Moscow', street: 'Lenina', house: '1', postcode: '123',
            },
            items: [{name: 'Chicken BBQ', size: 'MEDIUM', qty: 2}],
        }),
    });

    expect(response.status).toBe(201);
    const body: unknown = await response.json();
    const order = orderResponseSchema.parse(body);
});