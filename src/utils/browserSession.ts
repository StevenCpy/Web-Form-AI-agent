import { chromium, Page } from "playwright"

export async function createSession(url: string): Promise<Page> {
    const browser = await chromium.launch({
        // opens visible page
        headless: false
    })
    const currentPage = await browser.newPage()
    await currentPage.goto(url)

    return currentPage
}