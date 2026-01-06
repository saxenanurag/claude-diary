# Gemini Diary Extension

This extension provides long-term memory capabilities for Gemini CLI. It allows you to:

1.  **Generate Diary Entries**: Capture key details, decisions, and learnings from your sessions.
2.  **Reflect**: Analyze patterns across multiple diary entries to improve future interactions.
3.  **Auto-Memory**: Automatically generate diary entries when you end a session.

## Tools and Commands

- `/diary`: Manually generate a diary entry for the current session.
- `/reflect`: Analyze past diary entries to find patterns.

## Auto-Memory

The extension includes a `SessionEnd` hook that automatically attempts to generate a diary entry when you exit the session. This requires the `GEMINI_API_KEY` environment variable to be set.
