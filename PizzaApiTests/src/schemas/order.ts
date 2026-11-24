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