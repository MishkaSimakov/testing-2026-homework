import {expect, test} from '@playwright/test';
import {DisabledInputPage} from "@/disabled-input/DisabledInputPage";

test('initially input is disabled', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    expect(await app.input.isDisabled()).toBe(true);
});

test('button click doesnt immediately enable button', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    await app.enableButton.click();
    await expect(app.input).toBeDisabled();
});

test('button click updates status', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    await app.enableButton.click();
    await expect(app.status).toContainText("Input Disabled");
});

test('button click eventually enables input', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    await app.enableButton.click();

    await app.waitUntilInputEnabled();

    // input is enabled
    await expect(app.input).toBeEnabled();

    // text is properly displayed
    const text = "Hello world!";

    await app.input.fill(text);
    await expect(app.input).toContainText(text);
});

test('status is updated when input becomes enabled', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    await app.enableButton.click();

    await app.waitUntilInputEnabled();

    await expect(app.status).toContainText("Input Enabled");
});
