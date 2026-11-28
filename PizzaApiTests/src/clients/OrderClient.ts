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

    showURL() {
        return `${this.baseUrl}/orders`;
    }

    async show() {
        return this.request(this.showURL(), 200, orderListResponseSchema);
    }

    createURL() {
        return `${this.baseUrl}/orders`;
    }

    async create(address: OrderAddress, items: OrderItem[]) {
        return this.request(this.createURL(), 201, orderResponseSchema, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({address, items}),
        });
    }

    updateStatusURL(orderId: string) {
        return `${this.baseUrl}/orders/${orderId}/status`;
    }

    async updateStatus(orderId: string, newStatus: OrderStatus) {
        return this.request(this.updateStatusURL(orderId), 200, orderResponseSchema, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: newStatus}),
        });
    }

    getURL(orderId: string) {
        return `${this.baseUrl}/orders/${orderId}`;
    }

    async get(orderId: string) {
        return this.request(this.getURL(orderId), 200, orderResponseSchema);
    }

    deleteURL(orderId: string) {
        return `${this.baseUrl}/orders/${orderId}`;
    }

    async delete(orderId: string, reason: string): Promise<ApiResult<void>> {
        const query = new URLSearchParams({reason});

        const response = await fetch(`${this.deleteURL(orderId)}?${query}`, {
            method: 'DELETE',
        });

        return {status: response.status};
    }

    removeURL(orderId: string) {
        return `${this.baseUrl}/orders/${orderId}/remove`;
    }

    async remove(orderId: string, reason: string): Promise<ApiResult<void>> {
        const query = new URLSearchParams({reason});

        const response = await fetch(`${this.removeURL(orderId)}?${query}`, {
            method: 'DELETE',
        });

        return {status: response.status};
    }

    createWorkflowOrderURL() {
        return `${this.baseUrl}/seminar/workflow/orders`;
    }

    async createWorkflowOrder(address: OrderAddress, items: OrderItem[]) {
        return this.request(this.createWorkflowOrderURL(), 200, workflowStepResponseSchema, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({address, items}),
        });
    }

    receivePaymentURL(orderId: string) {
        return `${this.baseUrl}/seminar/workflow/orders/${orderId}/payment-received`;
    }

    async receivePayment(orderId: string) {
        return this.request(this.receivePaymentURL(orderId), 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    startCookingURL(orderId: string) {
        return `${this.baseUrl}/seminar/workflow/orders/${orderId}/start-cooking`;
    }

    async startCooking(orderId: string) {
        return this.request(this.startCookingURL(orderId), 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    assignCourierURL(orderId: string) {
        return `${this.baseUrl}/seminar/workflow/orders/${orderId}/assign-courier`;
    }

    async assignCourier(orderId: string) {
        return this.request(this.assignCourierURL(orderId), 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    deliverURL(orderId: string) {
        return `${this.baseUrl}/seminar/workflow/orders/${orderId}/deliver`;
    }

    async deliver(orderId: string) {
        return this.request(this.deliverURL(orderId), 200, workflowStepResponseSchema, {
            method: 'POST',
        });
    }

    getBoardURL(orderId: string) {
        return `${this.baseUrl}/seminar/workflow/orders/${orderId}/board`;
    }

    async getBoard(orderId: string) {
        return this.request(this.getBoardURL(orderId), 200, orderBoardResponseSchema);
    }

    private async request<T>(
        path: string,
        expectedStatus: number,
        schema: ZodType<T>,
        init?: RequestInit,
    ): Promise<ApiResult<T>> {
        const response = await fetch(path, init);

        if (response.status !== expectedStatus) {
            return {status: response.status};
        }

        return {
            status: response.status,
            body: schema.parse(await response.json())
        };
    }
}
