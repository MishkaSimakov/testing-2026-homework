import {OrderClient} from "@/clients/OrderClient";
import {makeOrderAddress, makeOrderItem} from "@/factories/order";
import {assert, expect} from "vitest";
import {orderResponseSchema} from "@/schemas/order";
import {OrderStatus} from "@/data/OrderStatus";

export function client() {
    assert(process.env.PIZZA_API_URL);

    return new OrderClient(process.env.PIZZA_API_URL);
}

export function fakeUUID() {
    return "7a03b912-4a72-42ad-b0e4-c189adc5258a";
}

// Creates one fake order through API, checks that status is 201, and returns the newly created order
export async function createFakeOrder() {
    const order = {
        address: makeOrderAddress(),
        items: [makeOrderItem()],
    };

    const response = await client().create(order.address, order.items);

    expect(response.status).toBe(201);
    assert(response.body);

    return response.body;
}

// Same as createFakeOrder, but creates @count fake orders
export async function createFakeOrders(count: number = 5) {
    const orders: ReturnType<typeof orderResponseSchema.parse>[] = [];

    for (let i = 0; i < count; ++i) {
        orders.push(await createFakeOrder());
    }

    return orders;
}

// Creates one fake order through workflow API, checks that status is 201, and returns the newly created order
export async function createFakeWorkflowOrder() {
    const order = {
        address: makeOrderAddress(),
        items: [makeOrderItem()],
    };

    const response = await client().createWorkflowOrder(order.address, order.items);

    expect(response.status).toBe(200);
    assert(response.body);

    return response.body;
}

// Same as createFakeWorkflowOrder, but creates @count fake orders
export async function createFakeWorkflowOrders(count: number = 5) {
    const orders: ReturnType<typeof orderResponseSchema.parse>[] = [];

    for (let i = 0; i < count; ++i) {
        orders.push(await createFakeOrder());
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