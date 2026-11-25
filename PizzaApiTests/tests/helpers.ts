import {OrderClient} from "@/clients/OrderClient";
import {makeOrderAddress, makeOrderItem} from "@/factories/order";
import {expect, assert} from "vitest";
import {orderResponseSchema} from "@/schemas/order";
import {OrderStatus} from "@/data/OrderStatus";

export function client() {
    assert(process.env.PIZZA_API_URL);

    return new OrderClient(process.env.PIZZA_API_URL);
}

export function fakeUUID() {
    return "7a03b912-4a72-42ad-b0e4-c189adc5258a";
}

// Creates @count fake orders and returns array of response bodies for each of them
export async function createFakeOrders(count: number = 5) {
    const orders: ReturnType<typeof orderResponseSchema.parse>[] = [];

    for (let i = 0; i < 5; ++i) {
        const order = {
            address: makeOrderAddress(),
            items: [makeOrderItem()],
        };

        const response = await client().create(order.address, order.items);

        expect(response.status).toBe(201);
        assert(response.body);

        orders.push(response.body);
    }

    return orders;
}

// Accepts an order with CREATED status.
// Advances its status through all stages so that after this call the order's status is @newStatus.
export async function advanceCreatedOrderStatus(orderId: string, newStatus: OrderStatus) {
    if (newStatus == 'CREATED') {
        return;
    }

    const positiveFlowStatuses: OrderStatus[] = ['PAID', 'COOKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    if (!positiveFlowStatuses.includes(newStatus)) {
        throw RangeError("newStatus must be one of: " + positiveFlowStatuses.join(", ") + ".");
    }

    for (const status of positiveFlowStatuses) {
        const statusUpdateResponse = await client().updateStatus(orderId, status);
        expect(statusUpdateResponse.status).toBe(200);

        if (status == newStatus) {
            break
        }
    }
}