**GOAL:**\
Developing an AI agent that takes a workflow to automatically fill out a web form.

AI agent filling out web form given workflow:

https://github.com/user-attachments/assets/a3b9c47d-cc4b-4299-a9b1-c8513f6acef1

Tracing how AI agent executes the workflow:\
<img width="20%" alt="Agent executing workflow" src="https://github.com/user-attachments/assets/f2490021-ad15-4800-b425-1c912f2e0386" />

This is an example workflow:
1. Go to https://student-web-form.vercel.app/
2. Fill out the form with:
    1. First Name: Harry
    2. Last Name: Potter
    3. Date of birth: 1980-07-31
    4. Gender: Male
    5. Country: Canada
    6. Email: Harry.Potter@gmail.com
    7. Phone Number: +1(234)-567-8990
    8. Level: Undergraduate
    9. Major: Computer Science
    10. GPA: 3.8
3. Submit the form.

The workflow is fed as a prompt to the AI agent, which executes the workflow automatically.

~~The agent runs on a local llama3.1:8b model as its LLM brain.  The model needs to be running using the Ollama engine.  The prompt has been optimized for that specific model.~~
The agent runs on the gemini-3.5-flash model as its LLM brain.

**HOW TO RUN:**\
**If using gemini-3.5-flash:**
1. Set gemini API key environment variable "GOOGLE_GENERATIVE_AI_API_KEY" in an .env file.
2. "npm install"
3. "npm run dev".  This starts the AI agent server.
4. "npm run example".  This sends the workflow example (/src/data/workflow.ts) to the server.
Modify the workflow to fill out another web form on another website.

**If using offline Ollama model:**
1. Download the Ollama app from the Ollama website, and start it.
2. On terminal,
    1. OLLAMA_KEEP_ALIVE=-1.  This will keep the model loaded in memory even if it's idle.
    2. "ollama run llama3.1:8b".  This will download the model (4.9GB), making it accessible offline, then run it.  RAM usage minimum 5.6GB.
    Wait until the model starts running.
    3. "npm install"
    4. "npm run dev".  This starts the AI agent server.
    5. "npm run example".  This sends the workflow example (/src/data/workflow.ts) to the server.
Modify the workflow to fill out another web form on another website.

- Unload the model from memory with "ollama stop llama3.1:8b".
- Remove the model from storage with "ollama rm llama3.1:8b".