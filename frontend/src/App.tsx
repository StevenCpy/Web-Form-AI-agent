import { useState, useMemo } from 'react'
import { io } from "socket.io-client"

import { workflow } from './exampleWorkflow'

import './App.css'

function NoScreenshotText() {
	return (
		<div id="no-screenshot-text">
			Form screenshots will appear here
		</div>
	)
}

function App() {
	const [prompt, setPrompt] = useState("")
	const [notification, setNotification] = useState("")
	const [screenshot, setScreenshot] = useState<string|null>(null)

	const socket = useMemo(() => io("http://localhost:3000"), [])
	socket.on("notification", (msg: string) => {
		setNotification(msg)
	})

	return (
		<div id="content-page">
			<div id="frame-container">
				{screenshot ?? <NoScreenshotText />}
			</div>

			<div id="prompt-container">
				<div>
					{notification}
				</div>
				<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter workflow..." rows={10} />
				<div id="buttons-container">
					<div id="example-and-clear-buttons-container">
						<button id="example-workflow-button" onClick={ () => setPrompt(workflow) }>Paste example workflow</button>
						<button id="clear-button" onClick={ () => setPrompt("") }>Clear</button>
					</div>
					<button disabled={prompt === ""} id="submit-button" onClick={ () => {socket.emit("callAgent", prompt); setPrompt("") } }>Submit</button>
				</div>
			</div>
		</div>
	)
}

export default App
