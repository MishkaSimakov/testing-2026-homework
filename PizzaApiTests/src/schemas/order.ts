import {z} from 'zod';

export const addressSchema = z.object({
    city: z.string(),
    street: z.string(),
    house: z.string(),
    apartment: z.string().nullable(),
    postcode: z.string(),
});

export const pizzaItemSchema = z.object({
    name: z.string(),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
    qty: z.number().int().positive(),
});

export const orderStatusSchema = z.enum([
    'CREATED', 'PAID', 'COOKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
]);

export const orderSummarySchema = z.object({
    id: z.uuid(),
    status: orderStatusSchema,
    totalAmount: z.number().nonnegative(),
    currency: z.string(),
    deliveryZone: z.string(),
});

export const orderResponseSchema = orderSummarySchema.extend({
    id: z.uuid(),
    address: addressSchema,
    items: z.array(pizzaItemSchema).min(1),
    status: orderStatusSchema,
    totalAmount: z.number().nonnegative(),
    currency: z.string(),
    deliveryZone: z.string(),
    cancellationReason: z.string().nullable(),
});

export const orderListResponseSchema = z.array(orderSummarySchema);

export const orderBoardResponseSchema = orderSummarySchema
    .omit({status: true})
    .extend({
        currentStatus: orderStatusSchema,
        paymentReceived: z.boolean(),
        cookingStarted: z.boolean(),
        courierAssigned: z.boolean(),
        delivered: z.boolean(),
        nextSuggestedCommand: z.string(),
    });

export const workflowStepResponseSchema = z.object({
    orderId: z.uuid(),
    executedCommand: z.string(),
    emittedEvent: z.string(),
    currentStatus: orderStatusSchema,
    policyName: z.string(),
    suggestedNextCommand: z.string(),
    explanation: z.string(),
    board: orderBoardResponseSchema,
});
