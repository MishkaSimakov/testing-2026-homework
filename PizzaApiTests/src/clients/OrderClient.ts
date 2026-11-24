import {OrderStatus} from "@/data/OrderStatus";
import {ZodType} from "zod";
import {orderListResponseSchema, orderResponseSchema} from "@/schemas/order";
import {OrderAddress} from "@/data/OrderAddress";
import {OrderItem} from "@/data/OrderItem";

type ApiResult<T> = { status: number; body?: T };

export class OrderClient {
    constructor(readonly baseUrl: string) {
    }

    private async request<T>(
        path: string,
        expectedStatus: number,
        schema: ZodType<T>,
        init?: RequestInit,
    ): Promise<ApiResult<T>> {
        const response = await fetch(`${this.baseUrl}${path}`, init);

        if (response.status !== expectedStatus) {
            return {status: response.status};
        }

        return {
            status: response.status,
            body: schema.parse(await response.json())
        };
    }

    show() {
        return this.request('/orders', 200, orderListResponseSchema);
    }

    create(address: OrderAddress, items: OrderItem[]) {
        return this.request('/orders', 201, orderResponseSchema, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({address, items}),
        });
    }


    updateStatus(orderId: string, newStatus: OrderStatus) {
        return this.request(`/orders/${orderId}/status`, 200, orderResponseSchema, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: newStatus}),
        });
    }
}