import {expect, test} from '@playwright/test';
import {ShadowDOMPage} from '@/shadow-dom/ShadowDOMPage';

test('copy button copies generated guid', async ({page}) => {
    const app = new ShadowDOMPage(page);
    await app.open();

    await app.generateButton.click();
    await app.copyButton.click();

    const guid = await app.guidInput.inputValue();

    await expect.poll(() => app.getClipboardContent()).toBe(guid);
});
