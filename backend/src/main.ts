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

    socket.on("disconnect", () => {
        console.log("User disconnected!")
    })

    socket.on("callAgent", async (workflow: string) => {
        console.log("Calling agent...")
        try {
            await queryAgent(socket, workflow)
        } catch (error) {
            console.error("Error calling agent")
            io.emit("notification", "Status: Fail, Error calling agent")
        }
    })
})

server.listen(PORT, () => {
    console.log(`AI agent listening on port ${PORT}`)
})