yes# Implementation Plan: Connect 5

## Overview
A single self-contained HTML file implementing Connect 5 with two-player and VS-AI modes on 15×15 or 19×19 grids. All game logic, AI, rendering, and styling are inline with no external dependencies. Work is divided into two tasks: core logic first (testable without a browser), then rendering and full game assembly second.

---

## Tasks

- [ ] 1. Core Game Logic and AI
  - [ ] 1.1 Implement GameState module in `src/index.html`
    - Define the `state` object with fields: `mode`, `size`, `board`, `currentPlayer`, `status`, `winner`, `winCells`, `aiLocked`
    - Implement `GameState.init(mode, size)` that resets all fields: creates an N×N board of zeros, sets `currentPlayer=1`, `status='playing'`, `winner=null`, `winCells=[]`, `aiLocked=false`
    - Expose `state` as the single mutable object; no other module writes to it directly
    - _Requirements: 2.2, 3.1, 9.1_

  - [ ] 1.2 Implement GameLogic module in `src/index.html`
    - Implement `GameLogic.placePiece(row, col)`: return early (no-op) if `state.status !== 'playing'` or `state.board[row][col] !== 0`; otherwise write `state.board[row][col] = state.currentPlayer`
    - Implement `GameLogic.checkWin(row, col)`: for each of the 4 direction vectors `(0,1)`, `(1,0)`, `(1,1)`, `(1,-1)`, count consecutive same-player cells forward and backward from `(row,col)`; declare win if and only if `fwd + bck + 1 === 5`; return the 5 winning `[row,col]` pairs or `null`
    - Implement `GameLogic.checkDraw()`: return `true` if every cell in `state.board` is non-zero and `state.winner` is null
    - Implement `GameLogic.nextTurn()`: flip `state.currentPlayer` between 1 and 2
    - After a successful `placePiece`, call `checkWin` then `checkDraw` in order; update `state.status`, `state.winner`, `state.winCells` accordingly; call `nextTurn()` only if game continues
    - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 6.1_

  - [ ] 1.3 Implement AIPlayer module in `src/index.html`
    - Define `JITTER_FACTOR = 800` as a module-level constant
    - Implement `AIPlayer.getCandidates(board, size)`: collect all empty cells within 2 steps (Chebyshev distance) of any occupied cell; if board is empty return the center cell `[Math.floor(size/2), Math.floor(size/2)]`
    - Implement `AIPlayer.scoreCell(board, row, col, player, size)`: for each of the 4 directions, count the open/blocked run length through `(row,col)` for `player` and return a weighted sum using: open-four=100000, blocked-four=10000, open-three=5000, blocked-three=500, open-two=200, single=10
    - Implement `AIPlayer.getBestMove(board, size)`: score each candidate as `scoreCell(..., 2, ...) - scoreCell(..., 1, ...)`, add `Math.random() * JITTER_FACTOR` to each score, return the `[row, col]` with the highest jittered score
    - Expose `AIPlayer.takeTurn()`: sets `state.aiLocked=true`, calls `getBestMove`, calls `GameLogic.placePiece` with the result, sets `state.aiLocked=false`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 1.4 Property test: Turn Alternation — `tests/connect5.test.js`
    - **Property 1: Turn Alternation**
    - **Validates: Requirements 3.1, 3.4**
    - Generate a random sequence of 2–20 valid (empty cell) moves on a 15×15 board; after each move assert that `state.currentPlayer` is the opposite of what it was before; assert the first move is always made by Player 1
    - Minimum 200 iterations

  - [ ]* 1.5 Property test: Occupied Cell Immutability — `tests/connect5.test.js`
    - **Property 2: Occupied Cell Immutability**
    - **Validates: Requirement 3.3**
    - Generate a random board with some occupied cells; attempt `placePiece` on a randomly chosen occupied cell; assert `state.board` is identical (deep equal) before and after the call
    - Minimum 200 iterations

  - [ ]* 1.6 Property test: Win Detection Completeness — `tests/connect5.test.js`
    - **Property 3: Win Detection Completeness (All Directions)**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - For each of the 4 directions, generate a random valid starting position with room for 5 cells; place exactly 5 same-player pieces with no same-player piece on either adjacent end; call `checkWin` on the middle cell; assert result is non-null and contains exactly those 5 cells
    - Minimum 200 iterations

  - [ ]* 1.7 Property test: Overline Rule — `tests/connect5.test.js`
    - **Property 4: Overline Rule — No Win on Six or More**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Generate a random valid starting position; place 6, 7, or 8 consecutive same-player pieces in a random direction; call `checkWin` on any cell in that run; assert result is `null`
    - Minimum 200 iterations

  - [ ]* 1.8 Property test: Game-Over Immutability — `tests/connect5.test.js`
    - **Property 5: Game-Over Immutability**
    - **Validates: Requirements 5.4, 6.1**
    - Set `state.status` to `'won'` or `'draw'`; snapshot `state.board`, `state.winner`, `state.winCells`; call `placePiece` on a random empty cell; assert all four fields are unchanged
    - Minimum 200 iterations

  - [ ]* 1.9 Property test: Draw Completeness — `tests/connect5.test.js`
    - **Property 6: Draw Completeness**
    - **Validates: Requirements 6.1, 6.2**
    - Generate a random fully-filled board (all cells non-zero) with no five-in-a-row for either player; call `checkDraw()`; assert it returns `true` and `state.status === 'draw'`
    - Minimum 200 iterations

  - [ ]* 1.10 Property test: AI Move Validity — `tests/connect5.test.js`
    - **Property 7: AI Move Validity**
    - **Validates: Requirements 4.2, 4.3**
    - Generate a random partially-filled board; record all empty cells before calling `AIPlayer.takeTurn()`; assert the AI placed its piece on a cell that was empty before the call and that no previously occupied cell changed
    - Minimum 200 iterations

  - [ ]* 1.11 Property test: AI Jitter Boundedness — `tests/connect5.test.js`
    - **Property 8: AI Jitter Boundedness**
    - **Validates: Requirement 4.4**
    - Generate a random set of 2–30 candidate cells with known base scores; spy on `Math.random` to return controlled values; assert every jitter added is in `[0, JITTER_FACTOR)` and the returned move has the highest jittered score among all candidates
    - Minimum 200 iterations

  - [ ]* 1.12 Property test: Board Size Integrity — `tests/connect5.test.js`
    - **Property 9: Board Size Integrity**
    - **Validates: Requirements 2.2, 9.1**
    - For size 15 and 19, run a random sequence of `placePiece` calls with random row/col values (including out-of-bounds); assert `state.board` is always exactly N×N and no out-of-bounds write ever occurs
    - Minimum 200 iterations

  - [ ] 1.13 Unit tests: GameLogic — `tests/connect5.test.js`
    - `placePiece` on empty cell: piece is placed and `currentPlayer` advances
    - `placePiece` on occupied cell: board unchanged, `currentPlayer` unchanged
    - `checkWin` horizontal 5 at left edge: returns 5 cells
    - `checkWin` horizontal 5 at right edge: returns 5 cells
    - `checkWin` vertical 5 at top: returns 5 cells
    - `checkWin` vertical 5 at bottom: returns 5 cells
    - `checkWin` diagonal ↘ from top-left corner: returns 5 cells
    - `checkWin` diagonal ↗ from bottom-left corner: returns 5 cells
    - `checkWin` horizontal 6 in a row: returns `null`
    - `checkWin` vertical 6 in a row: returns `null`
    - `checkDraw` on full board with no winner: returns `true`, `state.status === 'draw'`
    - `checkDraw` on full board where winner exists: returns `false`
    - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 6.1_

  - [ ] 1.14 Unit tests: AIPlayer — `tests/connect5.test.js`
    - `getBestMove` on empty 15×15 board: returns `[7, 7]`
    - `getBestMove` on empty 19×19 board: returns `[9, 9]`
    - `getBestMove` when AI has an open four: returns the completing move
    - `getBestMove` when human has an open four: returns the blocking move
    - Jitter value for any candidate is always `>= 0` and `< JITTER_FACTOR`
    - _Requirements: 4.2, 4.4_

---

- [ ] 2. Rendering, Input, and Full Game Assembly
  - [ ] 2.1 Build HTML skeleton in `src/index.html`
    - Create four screen `<div>`s with ids: `screen-menu`, `screen-size`, `screen-game`, `screen-end`
    - `screen-menu`: title, two buttons "Two Player" and "VS AI"
    - `screen-size`: back context label, two buttons "15×15" and "19×19"
    - `screen-game`: turn indicator `<div id="status-bar">`, board container `<div id="board">`, no other controls
    - `screen-end`: result message `<div id="result-msg">`, "Play Again" button, "Main Menu" button
    - Only `screen-menu` is visible on load; all others have `display:none`
    - _Requirements: 1.1, 2.1, 7.1, 7.2, 7.3_

  - [ ] 2.2 Implement embedded CSS futuristic theme in `src/index.html`
    - Dark background: `#0a0a0f`; primary accent: `#00e5ff` (cyan); secondary accent: `#ff4081` (pink)
    - All screens use the same font stack: `'Courier New', monospace` for a terminal aesthetic
    - Buttons: dark background, cyan border, cyan text, `box-shadow` glow on hover, `transform: scale(1.05)` transition on hover (150ms ease)
    - Screen transitions: outgoing screen fades to opacity 0 over 200ms, incoming screen fades in from opacity 0 over 200ms
    - Board cells: `width: var(--cell-size); height: var(--cell-size)`, thin cyan border at 20% opacity, `background: transparent`
    - Piece player-1: cyan filled circle with radial gradient and drop-shadow glow; CSS `transform: scale(0) → scale(1)` animation over 180ms on insertion
    - Piece player-2: pink filled circle with radial gradient and drop-shadow glow; same scale-in animation
    - Hover state on empty cell (`.cell.hover`): ghost piece at 30% opacity in the current player's color
    - Win highlight (`.cell.win-highlight`): pulsing `box-shadow` keyframe animation at 1s infinite alternating between full glow and half glow
    - Status bar: centered, uppercase, letter-spacing 2px, cyan text
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 2.3 Implement Renderer module in `src/index.html`
    - Implement `Renderer.showScreen(name)`: remove `active` class from all screens, add `active` class to `screen-{name}`, trigger CSS fade transition
    - Implement `Renderer.recalcCellSize(w, h, size)`: compute `Math.max(4, Math.floor(Math.min(w * 0.92, h * 0.78) / size))`; set `document.getElementById('board').style.setProperty('--cell-size', result + 'px')`; return the computed value
    - Implement `Renderer.renderBoard()`: call `recalcCellSize(window.innerWidth, window.innerHeight, state.size)`; for each cell in `state.board`, create or reuse a `.cell` div with `data-row` and `data-col`; add `.piece.player-1` or `.piece.player-2` child if occupied; add `.win-highlight` class to cells in `state.winCells`
    - Implement `Renderer.renderStatus()`: set `#status-bar` text to `"Player 1's Turn"` or `"Player 2's Turn"` or `"AI Thinking…"` based on `state.currentPlayer` and `state.aiLocked`
    - Implement `Renderer.renderEndScreen()`: set `#result-msg` text to `"Player 1 Wins"`, `"Player 2 Wins"`, or `"Draw"` based on `state.winner`; call `showScreen('end')`
    - _Requirements: 7.1, 8.1, 8.2, 8.3, 8.5, 9.5_

  - [ ] 2.4 Implement InputHandler module in `src/index.html`
    - On `DOMContentLoaded`: attach click listeners to "Two Player" → `state.mode='two-player'`, `Renderer.showScreen('size')`; "VS AI" → `state.mode='vs-ai'`, `Renderer.showScreen('size')`
    - Size buttons: "15×15" → `GameState.init(state.mode, 15)`, `Renderer.showScreen('game')`, `Renderer.renderBoard()`, `Renderer.renderStatus()`; "19×19" same with size 19
    - "Play Again": `GameState.init(state.mode, state.size)`, `Renderer.showScreen('game')`, `Renderer.renderBoard()`, `Renderer.renderStatus()`
    - "Main Menu": `state.mode=null`, `state.size=null`, `Renderer.showScreen('menu')`
    - Board click (event delegation on `#board`): read `data-row`/`data-col` from `event.target.closest('.cell')`; if `state.status==='playing'` and `!state.aiLocked` and cell is empty, call `GameLogic.placePiece(row,col)`; then call `Renderer.renderBoard()` and `Renderer.renderStatus()`; if game over call `Renderer.renderEndScreen()`; else if VS-AI and still playing schedule `setTimeout(AIPlayer.takeTurn, 300)` then re-render
    - Board hover (mouseover/mouseout delegation): add `.hover` class to `.cell` on mouseover if cell is empty and `!state.aiLocked`; remove on mouseout
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 7.2, 7.3, 8.4_

  - [ ] 2.5 Implement ResizeHandler module in `src/index.html`
    - Attach `window.addEventListener('resize', handler)` where `handler` is debounced 100ms
    - On fire: if `state.status === 'playing'` or `state.status === 'won'` or `state.status === 'draw'`, call `Renderer.renderBoard()` to recompute cell size and redraw; all piece and win-highlight state is preserved because `renderBoard` reads from `state.board` and `state.winCells`
    - _Requirements: 9.5_

  - [ ]* 2.6 Property test: Responsive Cell Size — `tests/connect5.test.js`
    - **Property 10: Responsive Cell Size**
    - **Validates: Requirement 9.5**
    - Generate random viewport widths `[200, 3840]` and heights `[200, 2160]` for both grid sizes 15 and 19; assert `recalcCellSize(w, h, size)` equals `Math.max(4, Math.floor(Math.min(w * 0.92, h * 0.78) / size))` and is always `>= 4`
    - Minimum 200 iterations

  - [ ] 2.7 Unit tests: Renderer — `tests/connect5.test.js`
    - `recalcCellSize(1200, 800, 15)` → `Math.max(4, Math.floor(Math.min(1104, 624) / 15))` = `41`
    - `recalcCellSize(800, 600, 19)` → `Math.max(4, Math.floor(Math.min(736, 468) / 19))` = `24`
    - `recalcCellSize(40, 30, 15)` → clamped to `4`
    - `recalcCellSize(40, 30, 19)` → clamped to `4`
    - _Requirements: 9.5_

  - [ ] 2.8 Integration tests — `tests/connect5.test.js`
    - Two-player 15×15: simulate placing pieces to form a horizontal win for Player 1; assert `state.status==='won'`, `state.winner===1`, `state.winCells.length===5`, end screen result message is "Player 1 Wins"
    - Two-player 19×19: fill the board without a winner (use a known draw pattern); assert `state.status==='draw'`, end screen result message is "Draw"
    - VS-AI: human places a piece; assert `state.aiLocked` becomes `true`; after AI `setTimeout` resolves, assert `state.aiLocked===false` and a new piece exists on the board
    - "Play Again": set `state` to a finished game; simulate click; assert `state.status==='playing'`, `state.board` is all zeros, `state.currentPlayer===1`, same mode and size preserved
    - "Main Menu": simulate click from end screen; assert `state.mode===null`, `state.size===null`, `screen-menu` is the active screen
    - Resize during game: set a mid-game board state; fire a resize event; assert `renderBoard` was called and all existing pieces are still present in the DOM
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 4.2, 5.4, 6.2, 7.1, 7.2, 7.3, 9.5_

---

- [ ] 3. Final Checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all unit, property, and integration tests pass
  - Confirm test coverage of logic functions is ≥ 90%
  - Open `src/index.html` directly in Chrome, Firefox, and Safari; verify the game is playable end-to-end
  - Ask the user if any questions arise

---

## Notes

- **Optional subtasks**: 1.4–1.12 and 2.6 are marked `*` (optional for fast MVP, required for production). They cover all 10 correctness properties from `design.md`. The remaining subtasks are required.
- **Requirements traceability**: Every requirement (1.1–9.5) maps to at least one subtask. The `_Requirements:` tag at the end of each subtask provides the mapping.
- **Testing approach**: Logic modules (`GameState`, `GameLogic`, `AIPlayer`) are extracted as CommonJS exports for Node.js testing — no DOM required. `Renderer` tests use jsdom. Property tests use `fast-check` (dev dependency only, never bundled into `index.html`).
- **Single file constraint**: All production code lives in `src/index.html`. Test infrastructure (`package.json`, `tests/`, `node_modules/`) exists only for development and is never referenced by the HTML file.
- **Module pattern**: Each module is an IIFE assigned to a `const` (e.g. `const GameLogic = (() => { ... })()`). For Node.js testing, wrap each module with `if (typeof module !== 'undefined') module.exports = ...`.
- **JITTER_FACTOR**: Fixed at `800`. Do not make this configurable — it is a design constant, not a setting.
- **Cell size minimum**: Always clamp to `4px` minimum. Never let cell size reach 0 or negative.
- **No TODOs in production code**: Every function must be fully implemented before the task is marked complete.
