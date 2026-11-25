import {expect, assert, test} from 'vitest';
import {client, createFakeOrders} from "./helpers";
import {makeOrderAddress, makeOrderItem} from "@/factories/order";
import {OrderStatus} from "@/data/OrderStatus";

test('GET /orders is empty when no orders were created', async () => {
    const response = await client().show();

    expect(response.status).toBe(200);
    assert(response.body);

    expect(response.body.length).toBe(0);
});

test('POST /orders returns correct response', async () => {
    const testOrderAddress = makeOrderAddress();
    const testOrderItems = [makeOrderItem()];

    const response = await client().create(testOrderAddress, testOrderItems);

    expect(response.status).toBe(201);
    assert(response.body);

    expect(response.body.address).toEqual({
        ...testOrderAddress,
        apartment: null,
    });
    expect(response.body.items).toEqual(testOrderItems);

    expect(response.body.status).toBe('CREATED');
    expect(response.body.currency).toBe('EUR');
    expect(response.body.cancellationReason).toBeNull();
});

test('POST /orders assigns different ids', async () => {
    const orders = await createFakeOrders(2)

    expect(orders[0]!.id).not.toEqual(orders[1]!.id);
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

test('GET /orders/{id} returns correct order', async () => {
    const expectedOrders = await createFakeOrders(5);

    const orderInfo = await client().get(expectedOrders[0]!.id);

    expect(orderInfo.status).toBe(200);
    assert(orderInfo.body);

    expect(orderInfo.body.id).toEqual(expectedOrders[0]!.id);
});

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

test('PATCH /orders/{id}/status allows to cancel order', async () => {
    const orders = await createFakeOrders(5);
    expect(orders[0]!.status).toBe('CREATED');

    const orderInfo = await client().updateStatus(orders[0]!.id, 'CANCELLED');

    expect(orderInfo.status).toBe(200);
    assert(orderInfo.body);

    expect(orderInfo.body.id).toEqual(orders[0]!.id);
    expect(orderInfo.body.status).toEqual('CANCELLED');
});


test('GET /orders/{id} fails when id doesnt exist', async () => {
    const orderInfo = await client().get("123");

    expect(orderInfo.status).not.toBe(200);
});