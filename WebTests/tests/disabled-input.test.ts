import {expect, test} from '@playwright/test';
import {DisabledInputPage} from "@/disabled-input/DisabledInputPage";

test('initially input is enabled', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    await expect(app.input).toBeEnabled();
});

test('status reflects input changes', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    const text = "hello world 123!";

    // input text and remove focus
    await app.input.fill(text);
    await app.input.blur();

    await expect(app.status).toContainText(text);
});

test('button click doesnt immediately enable input', async ({page}) => {
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

    await expect(app.input).toBeEnabled();
});

test('status is updated when input becomes enabled', async ({page}) => {
    const app = new DisabledInputPage(page);
    await app.open();

    await app.enableButton.click();

    await app.waitUntilInputEnabled();

    await expect(app.status).toContainText("Input Enabled");
});
