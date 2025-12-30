# Gemini Diary Extension

This extension provides long-term memory capabilities for Gemini CLI. It mimics the "Claude Diary" functionality by allowing you to generate diary entries and reflect on them to improve future interactions.

## Installation

1.  Clone this repository or link it as an extension.
    ```bash
    gemini extensions link .
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set your `GEMINI_API_KEY` environment variable (required for auto-diary).

## Features

### Commands

- **/diary**: Manually generate a diary entry for the current session.
  - Usage: `/diary`
  - It analyzes the current context to create a structured markdown file in `~/.gemini/memory/diary/`.

- **/reflect**: Analyze past diary entries to find patterns.
  - Usage: `/reflect` (analyzes last 10 entries)
  - Usage: `/reflect last 20 entries`
  - Usage: `/reflect related to testing`
  - It generates a reflection document and proposes updates to `GEMINI.md`.

### Auto-Memory

The extension automatically records your session interactions and generates a diary entry when you exit the session (`/exit` or `exit`).

- **Recording**: Interactions are temporarily stored in `~/.gemini/memory/session-[ID].jsonl`.
- **Generation**: On exit, the extension uses the Gemini API to summarize the session into a diary entry.
- **Output**: You will see a message confirming the diary generation.

## Directory Structure

- `commands/`: Contains the command definitions (`diary.toml`, `reflect.toml`).
- `hooks/`: Contains the hook scripts (`record.js`, `auto-diary.js`).
- `gemini-extension.json`: Extension configuration.
- `GEMINI.md`: Context file loaded into the model.

## Configuration

The extension uses `~/.gemini/memory/` to store diary entries and reflections. You can customize the behavior by editing the scripts in `hooks/`.
