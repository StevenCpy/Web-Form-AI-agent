**System Design:**
- agent.ts contains the algorithm for the AI agent.
- main.ts contains the Express.js AI agent server that listens to API requests.
- utils/sanitizeHTML.ts removes "class" and "style" attributes, and svgs from HTML.  This reduces bloat in the HTML, resulting in lower token consumption and faster LLM response time.
- data/workflow.ts contains example of a workflow that is passed to the agent.
- run/sendWorkflow.ts simulates sending a workflow to the AI agent.

**How AI agent works:**
- It receives a set of tools that allows it to:
    - navigate to a URL
    - open a hidden section
    - fill out fields
    - submit a form
- On receiving a workflow for filling out a web form, it uses the given tools to execute the workflow, one tool per step.