import { useState, useMemo } from 'react'
import { io } from "socket.io-client"

import { workflow } from './exampleWorkflow'

import './App.css'

function App() {
	const [prompt, setPrompt] = useState("")

	const socket = useMemo(() => io("http://localhost:3000"), [])

	return (
		<div id="content-page">
			<div id="frame-container">

			</div>

			<div id="prompt-container">
				<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter workflow..." rows={10} />
				<button id="example-workflow-button" onClick={ () => setPrompt(workflow) }>Try example workflow</button>
			</div>
		</div>
	)
}

export default App
