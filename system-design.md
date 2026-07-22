**System Design:**
- agent.ts contains the algorithm for the AI agent.
- main.ts contains the Express.js AI agent server that listens to API requests.
- utils/sanitizeHTML.ts removes "class" and "style" attributes, and svgs from HTML.  This reduces bloat in the HTML, resulting in lower token consumption and faster LLM response time.
- data/workflow.ts contains example of a workflow that is passed to the agent.
- run/sendWorkflow.ts simulates sending a workflow to the AI agent.

**How AI agent works:**
- On receiving a workflow, it extracts the navigation URL, opens a Playwright browser and navigates to that page.
- It then extracts the form HTML, sanitizes it, and identifies all hidden sections.
- It opens each sections and fills out the fields based on the information in the workflow.
- Finally, it submits the form and closes the Playwright browser.