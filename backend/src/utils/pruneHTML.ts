import { Locator } from "playwright"

export async function pruneHTML(locator: Locator) : Promise<string> {
    const prunedHTML = await locator.evaluate(html => {
        const htmlCopy = html.cloneNode(true) as HTMLElement

        // remove "class" and "style" attributes, and svgs
        htmlCopy.querySelectorAll("svg").forEach(svg => svg.remove())
        htmlCopy.querySelectorAll("*").forEach(element => element.removeAttribute("class"))
        htmlCopy.querySelectorAll("*").forEach(element => element.removeAttribute("style"))

        return htmlCopy.innerHTML
    })

    return prunedHTML
}