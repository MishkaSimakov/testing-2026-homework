import {expect, assert, test} from 'vitest';
import {advanceCreatedOrderStatus, client, createFakeOrders, fakeUUID} from "./helpers";
import {OrderStatus} from "@/data/OrderStatus";

test('order can be deleted', async () => {
    const orders = await createFakeOrders(5);

    const validDeleteStatuses: OrderStatus[] = ['CREATED', 'PAID', 'COOKING'];

    for (let i = 0; i < validDeleteStatuses.length; ++i) {
        expect(orders[i]!.status).toBe('CREATED');

        await advanceCreatedOrderStatus(orders[i]!.id, validDeleteStatuses[i]!);

        // delete order
        const deleteResponse = await client().delete(orders[i]!.id, `just for fun ${i}`);
        expect(deleteResponse.status).toBe(204);

        // check that status is CANCELLED
        const orderResponse = await client().get(orders[i]!.id);
        expect(orderResponse.status).toBe(200);
        assert(orderResponse.body);

        expect(orderResponse.body.status).toEqual("CANCELLED");
        expect(orderResponse.body.cancellationReason).toEqual(`just for fun ${i}`);
    }
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
    const orders = await createFakeOrders(1);

    await advanceCreatedOrderStatus(orders[0]!.id, 'OUT_FOR_DELIVERY');

    const deleteResponse = await client().delete(orders[0]!.id, `just for fun`);

    expect(deleteResponse.status).toBe(409);
});

test('DELIVERED order cant be deleted', async () => {
    const orders = await createFakeOrders(1);

    await advanceCreatedOrderStatus(orders[0]!.id, 'DELIVERED');

    const deleteResponse = await client().delete(orders[0]!.id, `just for fun`);

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
])('error when reason is too long ($label)', async ({reason}) => {
    const orders = await createFakeOrders(1);

    const deleteResponse = await client().delete(orders[0]!.id, reason);

    expect(deleteResponse.status).toBe(400);
});
