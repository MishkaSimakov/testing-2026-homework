import {assert, expect, test} from 'vitest';
import {advanceCreatedOrderStatus, client, createFakeOrder, createFakeOrders, fakeUUID} from "./helpers";
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
    const order = await createFakeOrder();
    expect(order.status).toBe('CREATED');

    const orderInfo = await client().updateStatus(order.id, 'CANCELLED');

    expect(orderInfo.status).toBe(200);
    assert(orderInfo.body);

    expect(orderInfo.body.id).toEqual(order.id);
    expect(orderInfo.body.status).toEqual('CANCELLED');
});

test('PATCH /orders/{id}/status fails to cancel already CANCELLED', async () => {
    const order = await createFakeOrder();
    expect(order.status).toBe('CREATED');

    const orderInfo = await client().updateStatus(order.id, 'CANCELLED');
    expect(orderInfo.status).toBe(200);

    const orderInfo2 = await client().updateStatus(order.id, 'CANCELLED');
    expect(orderInfo2.status).toBe(409);
});

test('PATCH /orders/{id}/status fails for CREATED -> DELIVERED', async () => {
    const order = await createFakeOrder();

    const orderInfo = await client().updateStatus(order.id, 'DELIVERED');
    expect(orderInfo.status).toBe(409);
});

test('PATCH /orders/{id}/status fails for PAID -> OUT_FOR_DELIVERY', async () => {
    const order = await createFakeOrder();

    await advanceCreatedOrderStatus(order.id, 'PAID');

    const orderInfo = await client().updateStatus(order.id, 'OUT_FOR_DELIVERY');
    expect(orderInfo.status).toBe(409);
});

test('PATCH /orders/{id}/status fails when uuid is malformed', async () => {
    const orderInfo = await client().updateStatus('abracadabra', 'PAID');

    expect(orderInfo.status).toBe(400);
});

test('PATCH /orders/{id}/status fails when order doesnt exist', async () => {
    const orderInfo = await client().updateStatus(fakeUUID(), 'PAID');

    expect(orderInfo.status).toBe(404);
});

test.each([
    {label: 'missing status', body: {}},
    {label: 'blank status', body: {status: ''}},
    {label: 'unknown status', body: {status: 'UNKNOWN'}},
])('PATCH /orders/{id}/status rejects $label', async ({body}) => {
    const order = await createFakeOrder();

    const response = await fetch(client().updateStatusURL(order.id), {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    });

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(500);
});

test('status change fails when body is incorrect', async () => {
    const order = await createFakeOrder();

    const response = await fetch(client().updateStatusURL(order.id), {
        method: 'PATCH'
    });

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(500);
});
