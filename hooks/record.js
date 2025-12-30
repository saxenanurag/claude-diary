#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

async function main(inputJson) {
  const input = JSON.parse(inputJson);
  const { llm_request, llm_response } = input;
  const sessionId = process.env.GEMINI_SESSION_ID || 'unknown-session';

  // Use Home Directory for consistent storage
  const memoryDir = path.join(os.homedir(), '.gemini', 'memory');
  const sessionFile = path.join(memoryDir, `session-${sessionId}.jsonl`);

  fs.mkdirSync(memoryDir, { recursive: true });

  // Extract relevant parts handling Gemini Schema
  // User messages might be in 'messages' (OpenAI style if adapter used) or 'contents' (Gemini Native)
  // Gemini CLI 'AfterModel' payload structure is important here.
  // Assuming 'llm_request' matches Gemini API 'GenerateContentRequest' usually, but CLI might normalize.
  // The hooks guide says "messages" for user, "candidates" for response.

  // Safe extraction for User Message
  let userMsg = '';
  if (llm_request.messages) {
    // OpenAI Style
    userMsg = llm_request.messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0]?.content;
  } else if (llm_request.contents) {
    // Gemini Native Style
    const lastUserContent = llm_request.contents
      .filter(c => c.role === 'user')
      .pop();
    if (lastUserContent && lastUserContent.parts) {
      userMsg = lastUserContent.parts.map(p => p.text).join('');
    }
  }

  // Safe extraction for Model Response (including Tool Use)
  let modelMsg = '';
  let toolCalls = [];

  if (llm_response.candidates && llm_response.candidates[0]) {
    const parts = llm_response.candidates[0].content?.parts || [];

    // Extract text
    modelMsg = parts
      .map(p => p.text)
      .filter(Boolean)
      .join('');

    // Extract Function Calls
    toolCalls = parts
      .filter(p => p.functionCall)
      .map(p => ({
        name: p.functionCall.name,
        args: p.functionCall.args
      }));
  }

  if (userMsg || modelMsg || toolCalls.length > 0) {
    const interaction = {
      timestamp: new Date().toISOString(),
      user: userMsg,
      model: modelMsg,
      tools: toolCalls
    };
    fs.appendFileSync(sessionFile, JSON.stringify(interaction) + '\n');
  }

  console.log(JSON.stringify({}));
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
