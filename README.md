GOAL: Developing an AI agent that takes a workflow to automatically fill out a web form.

This is the workflow:
1. Go to ${URL}
2. Fill out the form with:
    1. First Name
    2. Last Name
    3. Date of Birth
    4. Gender
3. Submit the form.

The workflow is fed as a prompt to the AI agent, which parses the prompt and performs the workflow automatically.

The agent runs on a local llama3.1:8b model as its LLM brain.  The model needs to be running using the Ollama engine.  The prompt has been optimized for that specific model.

HOW TO RUN:
1. Download the Ollama app from the Ollama website, and start it.
2. On terminal,
    1. OLLAMA_KEEP_ALIVE=-1.  This will keep the model loaded in memory even if it's idle.
    1. "ollama run llama3.1:8b".  This will download the model (4.9GB), making it accessible offline, then run it.  RAM usage minimum 5.6GB.
    Wait until the model starts running.
    2. "npm run dev"

- Unload the model from memory with "ollama stop llama3.1:8b".
- Remove the model from storage with "ollama rm llama3.1:8b".