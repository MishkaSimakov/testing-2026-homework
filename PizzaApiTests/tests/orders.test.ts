import {expect, assert, test} from 'vitest';
import {client} from "./helpers";

test('GET /orders is empty when no orders were created', async () => {
    const response = await client().show();

    expect(response.status).toBe(200);
    assert(response.body);

    expect(response.body.length).toBe(0);
});