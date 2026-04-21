# Connect 5

## Problem
There is no readily available, high-quality browser-based Connect 5 game that looks and feels premium while supporting both local two-player and solo-vs-AI modes.

## Target User
Casual desktop gamers who want a polished, modern game experience without installing anything.

## Current Solution and Gap
Existing browser Connect 5 implementations are visually dated and lack a good AI opponent. They feel like throwaway demos rather than a finished product.

## Proposed Solution
A single-file, frontend-only Connect 5 game with a futuristic premium UI. Players choose between two-player (same device) and vs-AI mode, then select a board size (15×15 or 19×19). The AI plays at a human-like level — competent but imperfect. After a game ends, players can replay with the same settings or return to the main menu.

## Success Criteria
- The game is fully playable in a modern desktop browser with no installation or dependencies
- Both game modes work correctly and the win condition (5 in a row) is reliably detected
- The AI feels like a human opponent — makes reasonable moves but occasionally errs
- The UI looks and feels premium and futuristic

## Constraints
- Pure frontend: single HTML file, vanilla JavaScript, no frameworks, no build step
- No backend, no persistence, no external dependencies
- Desktop only (no mobile layout required)
- Total file under 200 lines is a goal but secondary to quality

## Out of Scope
- Mobile/responsive layout
- Online multiplayer
- Game history or saved state
- Multiple AI difficulty levels
- Accounts or profiles

## Future Considerations
- Mobile support
- Online multiplayer via WebSockets
- Difficulty settings for the AI
- Timed moves
