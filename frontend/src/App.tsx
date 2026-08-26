import { useState, useMemo, useEffect } from 'react'
import { io } from "socket.io-client"

import { workflow } from './exampleWorkflow'

import './App.css'

function Base64Image( {base64ImageURL}: {base64ImageURL: string} ) {
	return (
		<div id="base64-img-container">
			<img src={`data:image/png;base64,${base64ImageURL}`} />
		</div>
	)
}

function NoScreenshotText() {
	return (
		<div id="no-screenshot-text">
			Form screenshots will appear here
		</div>
	)
}

const socket = io("http://localhost:3000")

function App() {
	const [prompt, setPrompt] = useState("")
	const [notification, setNotification] = useState("")
	const [screenshot, setScreenshot] = useState<string|null>(null)

	useEffect(() => {
		socket.on("notification", (msg: string) => {
			setNotification(msg)
		})

		socket.on("screenshot", (res: string[]) => {
			const [ res_notification, res_screenshotBase64 ] = res
			setNotification(res_notification)
			setScreenshot(res_screenshotBase64)
		})

		return () => {
			socket.off("notification")
			socket.off("screenshot")
		}
	}, [])

	return (
		<div id="content-page">
			<p>Welcome to my AI agent.  Write a workflow in the prompt and watch the agent fill out the form live!</p>
			<div id="frame-container">
				<p>Live stream of form completion:</p>
				{screenshot ? <Base64Image base64ImageURL={screenshot} /> : <NoScreenshotText />}
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
