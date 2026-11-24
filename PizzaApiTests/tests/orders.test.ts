import {expect, assert, test} from 'vitest';
import {client} from "./helpers";
import {OrderAddress} from "@/data/OrderAddress";
import {OrderItem} from "@/data/OrderItem";

test('GET /orders is empty when no orders were created', async () => {
    const response = await client().show();

    expect(response.status).toBe(200);
    assert(response.body);

    expect(response.body.length).toBe(0);
});

test('POST /orders returns correct response', async () => {
    const testOrderAddress: OrderAddress = {
        city: "Moscow",
        street: "Lenina",
        house: "White House",
        postcode: "123",
    };

    const testOrderItems: OrderItem[] = [
        {
            name: "Chicken BBQ",
            size: "MEDIUM",
            qty: 1,
        }
    ];

    const response = await client().create(testOrderAddress, testOrderItems);

    expect(response.status).toBe(201);
    assert(response.body);

    expect(response.body.address).toEqual({
        ...testOrderAddress,
        apartment: null,
    });
    expect(response.body.items).toEqual(testOrderItems);

    expect(response.body.status).toBe('CREATED');
    expect(response.body.totalAmount).toBe(10);
    expect(response.body.currency).toBe('EUR');
    expect(response.body.deliveryZone).toBe('OUTSKIRTS');
    expect(response.body.cancellationReason).toBeNull();
});