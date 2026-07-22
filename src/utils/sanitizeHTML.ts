import { Locator } from "playwright"

export async function sanitizeHTML(locator: Locator) : Promise<String> {
    const sanitizedHTML = await locator.evaluate(html => {
        const htmlCopy = html.cloneNode(true) as HTMLElement

        // remove svgs and "class" attribute
        htmlCopy.querySelectorAll("svg").forEach(svg => svg.remove())
        htmlCopy.querySelectorAll("*").forEach(element => element.removeAttribute("class"))
        htmlCopy.querySelectorAll("*").forEach(element => element.removeAttribute("style"))

        return htmlCopy.innerHTML
    })

    return sanitizedHTML
}