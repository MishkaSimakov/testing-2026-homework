import {assert, expect, test} from 'vitest';
import {advanceCreatedOrderStatus, client, createFakeOrder, createFakeOrders, fakeUUID} from "./helpers";

test.each(['CREATED', 'PAID', 'COOKING'] as const)('%s order can be removed', async (status) => {
        const order = await createFakeOrder();
        await advanceCreatedOrderStatus(order.id, status);

        const removeResponse = await client().remove(order.id, 'removed');
        expect(removeResponse.status).toBe(204);

        const orderResponse = await client().get(order.id);
        expect(orderResponse.status).toBe(404);
    },
);

test('order with malformed uuid cant be removed', async () => {
    const removeResponse = await client().remove("abracadabra", `just for fun`);

    expect(removeResponse.status).toBe(400);
});

test('non existing order cant be removed', async () => {
    const removeResponse = await client().remove(fakeUUID(), `just for fun`);

    expect(removeResponse.status).toBe(404);
});

test('OUT_FOR_DELIVERY order cant be removed', async () => {
    const order = await createFakeOrder();

    await advanceCreatedOrderStatus(order.id, 'OUT_FOR_DELIVERY');

    const removeResponse = await client().remove(order.id, `just for fun`);

    expect(removeResponse.status).toBe(409);
});

test('DELIVERED order cant be removed', async () => {
    const order = await createFakeOrder();

    await advanceCreatedOrderStatus(order.id, 'DELIVERED');

    const removeResponse = await client().remove(order.id, `just for fun`);

    expect(removeResponse.status).toBe(409);
});

test('fail to remove when reason is too long', async () => {
    const order = await createFakeOrder();

    const removeResponse = await client().remove(order.id, 'l'.repeat(1001));

    expect(removeResponse.status).toBe(400);
});

test('fail to remove when reason is empty', async () => {
    const order = await createFakeOrder();

    const removeResponse = await client().remove(order.id, '');

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
    const order = await createFakeOrder();
    const reason = "employees ate all ingredients, can't cook now :(";

    await client().delete(order.id, reason);

    const removeResponse = await client().remove(order.id, reason);

    expect(removeResponse.status).toBe(204);
});

test('CANCELLED order remove fail when reasons doesnt match', async () => {
    const order = await createFakeOrder();
    const reason = "employees ate all ingredients, can't cook now :(";

    await client().delete(order.id, reason);

    const removeResponse = await client().remove(order.id, "a different reason");

    expect(removeResponse.status).toBe(409);
});

test('remove fails when body is incorrect', async () => {
    const order = await createFakeOrder();

    const response = await fetch(client().removeURL(order.id), {
        method: 'DELETE'
    });

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(500);
});