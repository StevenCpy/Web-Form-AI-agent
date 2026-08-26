import { useState, useEffect } from 'react'
import { io } from "socket.io-client"

import { workflow } from './exampleWorkflow'

import './App.css'
import FrameContainer from './components/frameContainer'

const socket = io("http://localhost:3000")

const EVENTS_LIST_MAX_LENGTH = 15

function App() {
	const [prompt, setPrompt] = useState("")
	const [notification, setNotification] = useState("")
	const [screenshot, setScreenshot] = useState<string|null>(null)
	const [events, setEvents] = useState<String[]>([])

	useEffect(() => {
		socket.on("notification", (msg: string) => {
			setNotification(msg)
			setEvents(prev => [...prev, msg])
		})

		socket.on("screenshot", (res: string[]) => {
			const [ res_notification, res_screenshotBase64 ] = res
			setNotification(res_notification)
			setEvents(prev => [...prev, res_notification])
			setScreenshot(res_screenshotBase64)
		})

		return () => {
			socket.off("notification")
			socket.off("screenshot")
			socket.disconnect()
		}
	}, [])

	useEffect(() => {
		if (events.length > EVENTS_LIST_MAX_LENGTH) {
			const numEventsToDiscard = events.length - EVENTS_LIST_MAX_LENGTH
			setEvents(prev => prev.slice(numEventsToDiscard-1, events.length))
		}
	}, [events])

	return (
		<div id="content-page">
			<p>Welcome to my AI agent.<br />
			Write a workflow in the prompt and watch the agent fill out the form live!<br />
			- Steven </p>

			<FrameContainer screenshot={screenshot} />

			<div id="events-list">
				<p><b>List of events:</b></p>
				<ul>
					{events.map((event, index) =>
						<li key={index}>{index+1}. {event}</li>
					)}
				</ul>
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
