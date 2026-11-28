import {assert, expect, test} from 'vitest';
import {advanceCreatedOrderStatus, client, createFakeOrder, fakeUUID} from "./helpers";

test.each(['CREATED', 'PAID', 'COOKING'] as const)('%s order can be cancelled', async (status) => {
        const order = await createFakeOrder();
        await advanceCreatedOrderStatus(order.id, status);

        const cancelResponse = await client().delete(order.id, 'just for fun');
        expect(cancelResponse.status).toBe(204);

        const orderResponse = await client().get(order.id);
        expect(orderResponse.status).toBe(200);
        assert(orderResponse.body);

        expect(orderResponse.body.status).toEqual("CANCELLED");
        expect(orderResponse.body.cancellationReason).toEqual(`just for fun`);
    },
);

test('delete works second time when reason matches', async () => {
    const order = await createFakeOrder();

    const deleteResponse1 = await client().delete(order.id, `reason`);
    expect(deleteResponse1.status).toBe(204);

    const deleteResponse2 = await client().delete(order.id, `reason`);
    expect(deleteResponse2.status).toBe(204);
});

test('delete fails second time with when reason is different', async () => {
    const order = await createFakeOrder();

    const deleteResponse1 = await client().delete(order.id, `reason 1`);
    expect(deleteResponse1.status).toBe(204);

    const deleteResponse2 = await client().delete(order.id, `reason 2`);
    expect(deleteResponse2.status).toBe(409);
});

test('order with malformed uuid cant be deleted', async () => {
    const deleteResponse = await client().delete("abracadabra", `just for fun`);

    expect(deleteResponse.status).toBe(400);
});

test('non existing order cant be deleted', async () => {
    const deleteResponse = await client().delete(fakeUUID(), `just for fun`);

    expect(deleteResponse.status).toBe(404);
});

test('OUT_FOR_DELIVERY order cant be deleted', async () => {
    const order = await createFakeOrder();

    await advanceCreatedOrderStatus(order.id, 'OUT_FOR_DELIVERY');

    const deleteResponse = await client().delete(order.id, `just for fun`);

    expect(deleteResponse.status).toBe(409);
});

test('DELIVERED order cant be deleted', async () => {
    const order = await createFakeOrder();

    await advanceCreatedOrderStatus(order.id, 'DELIVERED');

    const deleteResponse = await client().delete(order.id, `just for fun`);

    expect(deleteResponse.status).toBe(409);
});

test.each([
    {
        label: 'Hamlet',
        reason: 'Therefore, since brevity is the soul of wit, And tediousness the limbs and outward flourishes, I will be brief. Your noble son is mad.'.repeat(10),
    },
    {
        label: '1001 characters',
        reason: 'l'.repeat(1001),
    },
    {
        label: 'empty',
        reason: '',
    },
])('error when reason is too long ($label)', async ({reason}) => {
    const order = await createFakeOrder();

    const deleteResponse = await client().delete(order.id, reason);

    expect(deleteResponse.status).toBe(400);
});

test('delete fails when body is incorrect', async () => {
    const order = await createFakeOrder();

    const response = await fetch(client().deleteURL(order.id), {
        method: 'DELETE'
    });

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(500);
});