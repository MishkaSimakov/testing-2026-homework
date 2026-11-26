import type {Locator, Page} from "@playwright/test";

export class ClearInputPage {
    readonly inputs: Locator;
    readonly statusText: Locator;

    constructor(private readonly page: Page) {
        this.inputs = page.locator('input, textarea, [contenteditable="true"]');
        this.statusText = page.locator('#opstatus');
    }

    async open() {
        await this.page.goto('/clearinput', {waitUntil: 'domcontentloaded'});
    }
}