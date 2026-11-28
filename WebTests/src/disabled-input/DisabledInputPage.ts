import {expect, Locator, Page} from "@playwright/test";

export class DisabledInputPage {
    readonly input: Locator;
    readonly enableButton: Locator;
    readonly status: Locator;

    constructor(private readonly page: Page) {
        this.input = page.locator('#inputField');
        this.enableButton = page.locator('#enableButton');
        this.status = page.locator('#opstatus');
    }

    async open() {
        await this.page.goto('/disabledinput', {waitUntil: 'domcontentloaded'});
    }

    async waitUntilInputEnabled() {
        await expect(this.input).toBeEnabled({timeout: 10_000});
    }
}