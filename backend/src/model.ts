// import { ollama } from "ai-sdk-ollama"
import "dotenv/config"
import { google } from "@ai-sdk/google"

// const model = ollama("llama3.1:8b")
const model = google("gemini-3.6-flash")

export default model