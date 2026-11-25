import {expect, assert, test} from 'vitest';
import {advanceCreatedOrderStatus, client, createFakeOrders, fakeUUID} from "./helpers";
import {OrderStatus} from "@/data/OrderStatus";

test('order can be removed', async () => {
    const orders = await createFakeOrders(5);

    const validDeleteStatuses: OrderStatus[] = ['CREATED', 'PAID', 'COOKING'];

    for (let i = 0; i < validDeleteStatuses.length; ++i) {
        expect(orders[i]!.status).toBe('CREATED');

        await advanceCreatedOrderStatus(orders[i]!.id, validDeleteStatuses[i]!);

        const removeResponse = await client().remove(orders[i]!.id, `just for fun ${i}`);
        expect(removeResponse.status).toBe(204);
    }
});

test('order with malformed uuid cant be removed', async () => {
    const removeResponse = await client().remove("abracadabra", `just for fun`);

    expect(removeResponse.status).toBe(400);
});

test('non existing order cant be removed', async () => {
    const removeResponse = await client().remove(fakeUUID(), `just for fun`);

    expect(removeResponse.status).toBe(404);
});

test('OUT_FOR_DELIVERY order cant be removed', async () => {
    const orders = await createFakeOrders(1);

    await advanceCreatedOrderStatus(orders[0]!.id, 'OUT_FOR_DELIVERY');

    const removeResponse = await client().remove(orders[0]!.id, `just for fun`);

    expect(removeResponse.status).toBe(409);
});

test('DELIVERED order cant be removed', async () => {
    const orders = await createFakeOrders(1);

    await advanceCreatedOrderStatus(orders[0]!.id, 'DELIVERED');

    const removeResponse = await client().remove(orders[0]!.id, `just for fun`);

    expect(removeResponse.status).toBe(409);
});

test('fail to remove when reason is too long', async () => {
    const orders = await createFakeOrders(1);

    const removeResponse = await client().remove(orders[0]!.id, 'l'.repeat(1001));

    expect(removeResponse.status).toBe(400);
});

test('fail to remove when reason is empty', async () => {
    const orders = await createFakeOrders(1);

    const removeResponse = await client().remove(orders[0]!.id, '');

    expect(removeResponse.status).toBe(400);
});

test('removed orders doesnt show up, not removed remain', async () => {
    const orders = await createFakeOrders(5);

    for (const order of orders.slice(0, 3)) {
        await client().remove(order.id, "removed");
    }

    const showResponse = await client().show();

    expect(showResponse.status).toBe(200);
    assert(showResponse.body);

    for (const order of orders.slice(0, 3)) {
        expect(showResponse.body.map(o => o.id)).not.toContain(order.id);
    }
    for (const order of orders.slice(3)) {
        expect(showResponse.body.map(o => o.id)).toContain(order.id);
    }
});

test('CANCELLED order can be removed when reasons match', async () => {
    const orders = await createFakeOrders(1);
    const reason = "employees ate all ingredients, can't cook now :(";

    await client().delete(orders[0]!.id, reason);

    const removeResponse = await client().remove(orders[0]!.id, reason);

    expect(removeResponse.status).toBe(204);
});

test('CANCELLED order remove fail when reasons doesnt match', async () => {
    const orders = await createFakeOrders(1);
    const reason = "employees ate all ingredients, can't cook now :(";

    await client().delete(orders[0]!.id, reason);

    const removeResponse = await client().remove(orders[0]!.id, "a different reason");

    expect(removeResponse.status).toBe(409);
});

test('remove fails when body is incorrect', async () => {
    const order = (await createFakeOrders(1))[0]!;

    const response = await fetch(client().removeURL(order.id), {
        method: 'DELETE'
    });

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(500);
});