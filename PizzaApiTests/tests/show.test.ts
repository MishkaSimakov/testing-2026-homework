import {assert, expect, test} from 'vitest';
import {client, createFakeOrders} from "./helpers";

test('GET /orders is empty when no orders were created', async () => {
    const response = await client().show();

    expect(response.status).toBe(200);
    assert(response.body);

    expect(response.body.length).toBe(0);
});

test('created orders are shown in GET /orders response', async () => {
    const expectedOrders = await createFakeOrders(5);

    const orders = await client().show();

    expect(orders.status).toBe(200);
    assert(orders.body);

    expect(orders.body.length).toBe(expectedOrders.length);

    for (const expectedOrder of expectedOrders) {
        expect(orders.body.map(o => o.id)).toContainEqual(expectedOrder.id);
    }
});
