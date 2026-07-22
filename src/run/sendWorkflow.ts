import { workflow } from "../data/workflow"

type ServerResponseType = {
    status: "success" | "fail"
    message: string
}

async function sendWorkflowToServer(workflow: string) {
    try {
        const response = await fetch("http://localhost:3000/api/agent", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                workflow: workflow
            })
        })
        const responseJSON: ServerResponseType = await response.json()
        console.log(`API response status: ${responseJSON.status}`)
    } catch (error) {
        console.error("Error calling API endpoint: ", error)
    }
}

sendWorkflowToServer(workflow)