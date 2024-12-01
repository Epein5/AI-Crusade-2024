# AI-Crusade-2024

## Introduction
Nepathaya is an advanced web-based assistant designed to provide localized, voice-based responses to user queries. The assistant leverages state-of-the-art technologies for speech recognition, language processing, and text-to-speech conversion to deliver a seamless user experience.

## Website

### User lands on website:
- The user accesses the website.

### Language Selected:
- The user selects their preferred language.

### Dynamic UI:
- The website's interface adjusts based on the user's language choice and interaction.
- Localized topic suggestion, follow-up questions:
  - The UI suggests topics and follow-up questions in the selected language.
- Stats conversation:
  - The conversation status or progress is tracked.

### Live transcription:
- The live audio from the user is transcribed and sent to the assistant.

## Assistant

### Speech to Text (Deepgram):
- Converts the live audio from the user into text.

### LLM (OpenAI GPT-4):
- Processes the transcribed text to understand the user's query.
- Function calling: findJobs:
  - The model can call functions to retrieve specific information, such as job offers.
- Q&A: RAG over docs:
  - The model can perform question answering using Retrieval-Augmented Generation (RAG) over a set of documents in the knowledge base.

### Text to Speech (Eleven Labs Multilingual v2):
- Converts the text response from the LLM into spoken language in the user's selected language.
- Voice answer in selected language:
  - The assistant provides a voice answer back to the user through the website's UI.

## Databases and Knowledge Base

### DB (Job offers):
- Contains information about job offers that the assistant can retrieve and present to the user.

### Knowledge Base:
- Contains information about local market regulations, salaries, accommodation prices, and other relevant data that the assistant can use to answer user queries.

## Flow Summary

### User Interaction:
- The user interacts with the dynamic UI on the website, selecting their language and engaging in conversation.

### Live Transcription:
- User's spoken inputs are transcribed in real-time and sent to the assistant.

### Query Processing:
- The assistant processes the transcribed text using an LLM to understand the query and fetch the relevant information from the databases or knowledge base.

### Response Generation:
- The assistant generates a text response, converts it into speech, and sends it back to the user through the website's UI.

This architecture ensures seamless interaction between the user and the assistant, providing localized, voice-based responses based on the user's language preference and query.

## Installation Steps

1. Install dependencies:
```bash
npm install
```

2. Generate embeddings:
```bash
npm run generate
```

3. Start the server:
```bash
npm run dev
```

4. Access the website:
- Open the website in your browser and start interacting with the AI-Crusade-2024 assistant.
