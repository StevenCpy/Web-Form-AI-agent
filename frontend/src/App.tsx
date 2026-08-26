import { useState } from 'react'
import { io } from "socket.io-client"

import './App.css'

function App() {
	io("http://localhost:3000")

	return (
		<>
			Test
		</>
	)
}

export default App
