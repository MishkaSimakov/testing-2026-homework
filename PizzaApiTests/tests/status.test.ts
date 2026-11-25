import {expect, assert, test} from 'vitest';
import {client, createFakeOrders, fakeUUID} from "./helpers";
import {OrderStatus} from "@/data/OrderStatus";

test('PATCH /orders/{id}/status changes status correctly', async () => {
    const orders = await createFakeOrders(5);

    expect(orders[0]!.status).toBe('CREATED');

    for (const status of ['PAID', 'COOKING', 'OUT_FOR_DELIVERY', 'DELIVERED']) {
        const orderInfo = await client().updateStatus(orders[0]!.id, status as OrderStatus);

        expect(orderInfo.status).toBe(200);
        assert(orderInfo.body);

        expect(orderInfo.body.id).toEqual(orders[0]!.id);
        expect(orderInfo.body.status).toEqual(status);
    }
});

test('PATCH /orders/{id}/status allows to cancel order', async () => {
    const orders = await createFakeOrders(5);
    expect(orders[0]!.status).toBe('CREATED');

    const orderInfo = await client().updateStatus(orders[0]!.id, 'CANCELLED');

    expect(orderInfo.status).toBe(200);
    assert(orderInfo.body);

    expect(orderInfo.body.id).toEqual(orders[0]!.id);
    expect(orderInfo.body.status).toEqual('CANCELLED');
});

test('PATCH /orders/{id}/status fails when uuid is malformed', async () => {
    const orderInfo = await client().updateStatus('abracadabra', 'PAID');

    expect(orderInfo.status).toBe(400);
});

test('PATCH /orders/{id}/status fails when order doesnt exist', async () => {
    const orderInfo = await client().updateStatus(fakeUUID(), 'PAID');

    expect(orderInfo.status).toBe(404);
});
