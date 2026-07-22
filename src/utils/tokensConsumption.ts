import { type LanguageModelUsage } from "ai"

export class tokensCounter {
    promptTokensConsumed: number = 0
    completionTokensConsumed: number = 0

    incrementConsumption(usage: LanguageModelUsage): void {
        if (usage.inputTokens && usage.outputTokens) {
            this.promptTokensConsumed += usage.inputTokens
            this.completionTokensConsumed += usage.outputTokens
        }
    }

    printConsumption(): void {
        const totalTokensConsumed = this.promptTokensConsumed + this.completionTokensConsumed

        console.log(`
            Total Token Consumption:
            Prompt tokens | Completion tokens | Total
            ${this.promptTokensConsumed} | ${this.completionTokensConsumed} | ${totalTokensConsumed}
        `)
    }
}