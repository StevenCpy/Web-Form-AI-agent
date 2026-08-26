import { chromium, Page } from "playwright"

export async function createSession(): Promise<Page> {
    const browser = await chromium.launch({
        // opens visible page
        headless: false
    })
    const currentPage = await browser.newPage()

    return currentPage
}