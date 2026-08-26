import express, { type Express, type Request, type Response } from "express"
import { queryAgent } from "./agent"

// Express.js server listens to requests on port 3000
// On receiving a POST request, endpoint extracts workflow and calls AI agent to exeute the workflow
const app: Express = express()
app.use(express.json())
const PORT = 3000

app.post("/api/agent", async (req: Request, res: Response) => {
    const { workflow } = req.body

    // no workflow in request body
    if (!workflow) {
        console.error("Error extracting workflow from request")
        return res.status(400).json({status: "fail", message: "Could not extract workflow from request"})
    }

    console.log("Calling agent...")
    try {
        await queryAgent(workflow)
    } catch (error) {
        console.error("Error calling agent")
        return res.status(500).json({status: "fail", message: "Error calling agent"})
    }
    return res.status(200).json({status: "success", message: "Agent successfully executed workflow!"})
})

app.listen(PORT, () => {
    console.log(`AI agent listening on port ${PORT}`)
})