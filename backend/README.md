# AI Code Editor - Backend

Node.js Express API powering the AI Code Editor.

## Services
- **Intent Service**: Processes code modification requests and generates diffs.
- **Explain Service**: Generates markdown explanations for code blocks.
- **Decision Store**: Logs all applied changes and AI reasoning to MongoDB.
- **LLM Handler**: Managed fallback logic between Google Gemini and OpenAI.

## Setup
1. Create `.env` from template.
2. `npm install`
3. `node server.js`

Refer to the [Root README](../README.md) for full project details.
