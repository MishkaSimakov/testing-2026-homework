import type {Locator, Page} from "@playwright/test";

export class ShadowDOMPage {
    readonly guidInput: Locator
    readonly generateButton: Locator
    readonly copyButton: Locator

    constructor(private readonly page: Page) {
        this.guidInput = page.locator('#editField');
        this.generateButton = page.locator('#buttonGenerate');
        this.copyButton = page.locator('#buttonCopy');
    }

    async open() {
        await this.page.goto('/shadowdom', {waitUntil: 'domcontentloaded'});
    }

    async getClipboardContent() {
        return await this.page.evaluate(() => navigator.clipboard.readText());
    }
}