import {expect, assert, test} from 'vitest';
import {client, createFakeOrders, fakeUUID} from "./helpers";

test('GET /orders/{id} returns correct order', async () => {
    const expectedOrders = await createFakeOrders(5);

    const orderInfo = await client().get(expectedOrders[0]!.id);

    expect(orderInfo.status).toBe(200);
    assert(orderInfo.body);

    expect(orderInfo.body.id).toEqual(expectedOrders[0]!.id);
});


test('GET /orders/{id} fails when uuid is malformed', async () => {
    const orderInfo = await client().get("123");

    expect(orderInfo.status).not.toBe(200);
});

test('GET /orders/{id} fails when order doesnt exist', async () => {
    const orderInfo = await client().get(fakeUUID());

    expect(orderInfo.status).not.toBe(200);
});