import {OrderStatus} from "@/data/OrderStatus";
import {ZodType} from "zod";
import {
    orderBoardResponseSchema,
    orderListResponseSchema,
    orderResponseSchema,
    workflowStepResponseSchema,
} from "@/schemas/order";
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

    async show() {
        return this.request('/orders', 200, orderListResponseSchema);
    }

    async create(address: OrderAddress, items: OrderItem[]) {
        return this.request('/orders', 201, orderResponseSchema, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({address, items}),
        });
    }

    async updateStatus(orderId: string, newStatus: OrderStatus) {
        return this.request(`/orders/${orderId}/status`, 200, orderResponseSchema, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: newStatus}),
        });
    }

    async get(orderId: string) {
        return this.request(`/orders/${orderId}`, 200, orderResponseSchema);
    }

    async delete(orderId: string, reason: string): Promise<ApiResult<void>> {
        const query = new URLSearchParams({reason});

        const response = await fetch(`${this.baseUrl}/orders/${orderId}?${query}`, {
            method: 'DELETE',
        });

        return {status: response.status};
    }

    async createWorkflowOrder(address: OrderAddress, items: OrderItem[]) {
        return this.request(`/seminar/workflow/orders`, 200, workflowStepResponseSchema, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({address, items}),
        });
    }

    async receivePayment(orderId: string) {
        return this.request(`/seminar/workflow/orders/${orderId}/payment-received`, 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    async startCooking(orderId: string) {
        return this.request(`/seminar/workflow/orders/${orderId}/start-cooking`, 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    async assignCourier(orderId: string) {
        return this.request(`/seminar/workflow/orders/${orderId}/assign-courier`, 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    async deliver(orderId: string) {
        return this.request(`/seminar/workflow/orders/${orderId}/deliver`, 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    async getBoard(orderId: string) {
        return this.request(`/seminar/workflow/orders/${orderId}/board`, 200, orderBoardResponseSchema);
    }
}
