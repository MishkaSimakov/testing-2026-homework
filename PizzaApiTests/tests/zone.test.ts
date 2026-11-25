import {expect, assert, test} from 'vitest';
import {client} from "./helpers";
import {makeOrderAddress, makeOrderItem} from "@/factories/order";

test.each([
    {
        postcode: "10123",
        expectedZone: "CENTER"
    },
    {
        postcode: "11123",
        expectedZone: "CENTER"
    },
    {
        postcode: "12123",
        expectedZone: "OUTSKIRTS"
    },
    {
        postcode: "13123",
        expectedZone: "OUTSKIRTS"
    },
])
('postcode $postcode correctly resolves to $expectedZone delivery zone', async ({postcode, expectedZone}) => {
    const response = await client().create(
        makeOrderAddress({postcode}),
        [makeOrderItem()]
    );

    expect(response.status).toBe(201);
    assert(response.body);

    expect(response.body.deliveryZone).toEqual(expectedZone);
});
