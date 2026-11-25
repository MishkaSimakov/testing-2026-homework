import {expect, assert, test} from 'vitest';
import {client} from "./helpers";
import {makeOrderAddress, makeOrderItem} from "@/factories/order";
import type {OrderItem} from "@/data/OrderItem";

const pricingCases: { items: Pick<OrderItem, 'size' | 'qty'>[]; expectedTotal: number }[] = [
    {
        items: [{size: 'SMALL', qty: 2}, {size: 'MEDIUM', qty: 1}],
        expectedTotal: 26,
    },
    {
        items: [{size: 'MEDIUM', qty: 1}, {size: 'LARGE', qty: 2}],
        expectedTotal: 34,
    },
    {
        items: [{size: 'SMALL', qty: 1}, {size: 'MEDIUM', qty: 2}, {size: 'LARGE', qty: 3}],
        expectedTotal: 64,
    },
];

test.each(pricingCases.map(pricingCase => ({
    combination: pricingCase.items.map(item => `${item.qty} x ${item.size}`).join(' + '),
    items: pricingCase.items,
    expectedTotal: pricingCase.expectedTotal,
})))('$combination price is $expectedTotal', async ({items, expectedTotal}) => {
    const response = await client().create(
        makeOrderAddress(),
        items.map(item => makeOrderItem(item))
    );

    expect(response.status).toBe(201);
    assert(response.body);

    expect(response.body.totalAmount).toBe(expectedTotal);
    expect(response.body.currency).toBe('EUR');
});
