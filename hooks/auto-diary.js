#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  // Silent fail if no API key is set
  process.exit(0);
}

async function main(inputJson) {
  const input = JSON.parse(inputJson);
  const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
  // Session ID is still useful for filenames, but we'll store in global memory
  const sessionId = process.env.GEMINI_SESSION_ID || 'unknown-session';

  // Use Home Directory for consistent storage
  const memoryDir = path.join(os.homedir(), '.gemini', 'memory');
  const sessionFile = path.join(memoryDir, `session-${sessionId}.jsonl`);

  if (!fs.existsSync(sessionFile)) {
    process.exit(0);
  }

  const interactions = fs.readFileSync(sessionFile, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));

  if (interactions.length === 0) {
    process.exit(0);
  }

  // Generate Diary
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an AI assistant creating a diary entry for a coding session.

    Session ID: ${sessionId}
    Project: ${projectDir}
    Timestamp: ${new Date().toISOString()}

    Review the following interaction history and create a structured diary entry.
    Follow this format:

    # Session Diary Entry

    **Date**: [YYYY-MM-DD]
    **Time**: [HH:MM:SS]
    **Session ID**: ${sessionId}
    **Project**: ${projectDir}

    ## Task Summary
    [2-3 sentences on what the user was trying to accomplish]

    ## Work Summary
    [Bullet list of accomplishments]

    ## Design Decisions Made
    [Key technical decisions and reasoning]

    ## Actions Taken
    [Files edited, tools used]

    ## Code Review & PR Feedback
    [Feedback, code quality issues]

    ## Challenges Encountered
    [Errors, failed approaches]

    ## Solutions Applied
    [How problems were resolved]

    ## User Preferences Observed
    [CRITICAL: Document preferences for commits, testing, style, etc.]

    ## Notes
    [Other observations]

    ---
    INTERACTIONS:
    ${JSON.stringify(interactions, null, 2)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const diaryContent = result.response.text();

    // Save to diary file
    const diaryDir = path.join(memoryDir, 'diary');
    fs.mkdirSync(diaryDir, { recursive: true });

    const today = new Date().toISOString().split('T')[0];
    let n = 1;
    let diaryFile = path.join(diaryDir, `${today}-session-${n}.md`);
    while (fs.existsSync(diaryFile)) {
      n++;
      diaryFile = path.join(diaryDir, `${today}-session-${n}.md`);
    }

    fs.writeFileSync(diaryFile, diaryContent);

    // Output system message to user
    console.log(JSON.stringify({
      systemMessage: `📝 Auto-generated diary entry: ${diaryFile}`
    }));

    // Cleanup
    fs.unlinkSync(sessionFile);

  } catch (error) {
    console.error('Error generating diary:', error);
    console.log(JSON.stringify({}));
  }
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

readStdin().then(main).catch(console.error);
