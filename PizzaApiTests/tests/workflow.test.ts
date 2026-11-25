import {expect, assert, test} from 'vitest';
import {client, createFakeOrders, fakeUUID} from "./helpers";
import {makeOrderAddress, makeOrderItem} from "@/factories/order";

test('workflow order can be delivered', async () => {
    const orderClient = client();
    const createResponse = await orderClient.createWorkflowOrder(makeOrderAddress(), [makeOrderItem()]);

    expect(createResponse.status).toBe(200);
    assert(createResponse.body);

    const orderId = createResponse.body.orderId;
    expect(createResponse.body).toMatchObject({
        currentStatus: 'CREATED',
        emittedEvent: 'OrderCreated',
        suggestedNextCommand: 'ReceivePayment',
    });

    const steps = [
        {
            run: () => orderClient.receivePayment(orderId),
            status: 'PAID',
            event: 'PaymentReceived',
            nextCommand: 'StartCooking',
        },
        {
            run: () => orderClient.startCooking(orderId),
            status: 'COOKING',
            event: 'CookingStarted',
            nextCommand: 'AssignCourier',
        },
        {
            run: () => orderClient.assignCourier(orderId),
            status: 'OUT_FOR_DELIVERY',
            event: 'CourierAssigned',
            nextCommand: 'DeliverOrder',
        },
        {
            run: () => orderClient.deliver(orderId),
            status: 'DELIVERED',
            event: 'OrderDelivered',
            nextCommand: 'None',
        },
    ];

    for (const step of steps) {
        const response = await step.run();

        expect(response.status).toBe(200);
        assert(response.body);

        expect(response.body).toMatchObject({
            orderId,
            currentStatus: step.status,
            emittedEvent: step.event,
            suggestedNextCommand: step.nextCommand,
        });
    }

    const boardResponse = await orderClient.getBoard(orderId);

    expect(boardResponse.status).toBe(200);
    assert(boardResponse.body);

    expect(boardResponse.body).toMatchObject({
        id: orderId,
        currentStatus: 'DELIVERED',
        paymentReceived: true,
        cookingStarted: true,
        courierAssigned: true,
        delivered: true,
        nextSuggestedCommand: 'None',
    });
});

test('workflow board shows cancelled order', async () => {
    const order = (await createFakeOrders(1))[0]!;
    const paymentResponse = await client().receivePayment(order.id);
    expect(paymentResponse.status).toBe(200);

    const deleteResponse = await client().delete(order.id, 'cancelled');
    expect(deleteResponse.status).toBe(204);

    const boardResponse = await client().getBoard(order.id);

    expect(boardResponse.status).toBe(200);
    assert(boardResponse.body);

    expect(boardResponse.body).toMatchObject({
        id: order.id,
        currentStatus: 'CANCELLED',
        paymentReceived: false,
        cookingStarted: false,
        courierAssigned: false,
        delivered: false,
        nextSuggestedCommand: 'None',
    });
});

test('POST /seminar/workflow/orders rejects empty items list', async () => {
    const response = await client().createWorkflowOrder(makeOrderAddress(), []);

    expect(response.status).toBe(400);
});

test('workflow payment fails when UUID is malformed', async () => {
    const response = await client().receivePayment('123');

    expect(response.status).toBe(400);
});

test('workflow payment fails when order doesnt exist', async () => {
    const response = await client().receivePayment(fakeUUID());

    expect(response.status).toBe(404);
});

test('workflow board fails when order doesnt exist', async () => {
    const response = await client().getBoard(fakeUUID());

    expect(response.status).toBe(404);
});
