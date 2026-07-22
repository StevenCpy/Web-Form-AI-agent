import express, { type Express, type Request, type Response } from "express"
import { queryAgent } from "./agent"
import { queryAgentLoop } from "./agentLoop"

// Express.js server listens to requests on port 3000
// On receiving a POST request, endpoint extracts workflow and calls AI agent to exeute the workflow
const app: Express = express()
app.use(express.json())
const PORT = 3000

app.post("/api/agent", async (req: Request, res: Response) => {
    const { workflow } = req.body

    console.log("Calling agent...")
    // await queryAgent(workflow)
    await queryAgentLoop(workflow)
    console.log("Agent completed task!")

    res.json({status: "success", message: "Agent completed task!"})
})

app.listen(PORT, () => {
    console.log(`AI agent listening on port ${PORT}`)
})