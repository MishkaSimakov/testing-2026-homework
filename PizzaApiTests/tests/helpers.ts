import {OrderClient} from "@/clients/OrderClient";
import * as assert from "node:assert";

export function client() {
    assert.ok(process.env.PIZZA_API_URL);

    return new OrderClient(process.env.PIZZA_API_URL);
}
