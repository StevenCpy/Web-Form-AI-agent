import { useState, useMemo } from 'react'
import { io } from "socket.io-client"

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
			</div>
		</div>
	)
}

export default App
