import {expect, test} from '@playwright/test';
import {ClearInputPage} from "@/clear-input/ClearInputPage";

test('initially all inputs are filled', async ({page}) => {
    const app = new ClearInputPage(page);
    await app.open();

    const inputsCount = await app.inputs.count();
    await expect(app.statusText).toContainText(inputsCount.toString());
});

test('status changes when all fields are cleared', async ({page}) => {
    const app = new ClearInputPage(page);
    await app.open();

    for (const input of await app.inputs.all()) {
        await input.clear();
        await expect(input).toBeEmpty();
    }

    await expect(app.statusText).toHaveText('All fields are cleared!');
});
