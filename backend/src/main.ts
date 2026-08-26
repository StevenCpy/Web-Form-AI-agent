import express, { type Express, type Request, type Response } from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { queryAgent } from "./agent"

// Express.js server listens to requests on port 3000
// On receiving a POST request, endpoint extracts workflow and calls AI agent to exeute the workflow
const app: Express = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

app.use(express.json())
const PORT = 3000

io.on("connection", (socket) => {
    console.log("New user connected!")
    io.emit("notification", "Connected to server...")

    io.on("disconnect", (socket) => {
        console.log("User disconnected!")
    })
})

app.post("/api/agent", async (req: Request, res: Response) => {
    const { workflow } = req.body

    // no workflow in request body
    if (!workflow) {
        console.error("Error extracting workflow from request")
        return res.status(400).json({status: "fail", message: "Could not extract workflow from request"})
    }

    console.log("Calling agent...")
    try {
        await queryAgent(io, workflow)
    } catch (error) {
        console.error("Error calling agent")
        return res.status(500).json({status: "fail", message: "Error calling agent"})
    }
    return res.status(200).json({status: "success", message: "Agent successfully executed workflow!"})
})

server.listen(PORT, () => {
    console.log(`AI agent listening on port ${PORT}`)
})