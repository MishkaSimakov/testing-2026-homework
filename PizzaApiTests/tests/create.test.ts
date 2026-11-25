import {expect, assert, test} from 'vitest';
import {client, createFakeOrders} from "./helpers";
import {makeOrderAddress, makeOrderItem} from "@/factories/order";
import {OrderAddress} from "@/data/OrderAddress";


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
    const orders = await createFakeOrders(2);

    expect(orders[0]!.id).not.toEqual(orders[1]!.id);
});

test.each([
    {
        field: "city",
    },
    {
        field: "street",
    },
    {
        field: "house",
    },
    {
        field: "postcode",
    }
])(`POST /orders fails when $field is not set`, async ({field}) => {
    const testOrderAddress = makeOrderAddress();
    const testOrderItems = [makeOrderItem()];

    delete testOrderAddress[field as keyof OrderAddress];

    const response = await client().create(testOrderAddress, testOrderItems);

    expect(response.status).toBe(400);
});

test(`POST /orders works without apartment`, async () => {
    const testOrderAddress = makeOrderAddress();
    const testOrderItems = [makeOrderItem()];

    delete testOrderAddress['apartment'];

    const response = await client().create(testOrderAddress, testOrderItems);

    expect(response.status).toBe(201);
});

test(`POST /orders rejects negative quantity`, async () => {
    const testOrderAddress = makeOrderAddress();
    const testOrderItems = [makeOrderItem()];

    testOrderItems[0]!.qty = -1;

    const response = await client().create(testOrderAddress, testOrderItems);

    expect(response.status).toBe(400);
});

test(`POST /orders rejects empty items list`, async () => {
    const response = await client().create(makeOrderAddress(), []);

    expect(response.status).toBe(400);
});
