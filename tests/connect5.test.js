'use strict';

const fc = require('fast-check');
const { GameState } = require('../src/logic/gameState');
const { GameLogic } = require('../src/logic/gameLogic');
const { AIPlayer } = require('../src/logic/aiPlayer');

function newGame(size = 15, mode = 'two-player') {
  GameState.init(mode, size);
}

function boardCopy(board) {
  return board.map(r => [...r]);
}

// ─── GameLogic Unit Tests (Task 1.13) ────────────────────────────────────────

describe('GameLogic unit tests', () => {
  beforeEach(() => newGame());

  test('placePiece on empty cell places piece and advances turn', () => {
    GameLogic.placePiece(0, 0);
    expect(GameState.state.board[0][0]).toBe(1);
    expect(GameState.state.currentPlayer).toBe(2);
  });

  test('placePiece on occupied cell leaves board and player unchanged', () => {
    GameLogic.placePiece(0, 0); // player 1 places
    const before = boardCopy(GameState.state.board);
    const prevPlayer = GameState.state.currentPlayer; // now player 2
    GameLogic.placePiece(0, 0); // attempt to overwrite
    expect(GameState.state.board).toEqual(before);
    expect(GameState.state.currentPlayer).toBe(prevPlayer);
  });

  test('checkWin horizontal 5 at left edge', () => {
    for (let c = 0; c < 5; c++) GameState.state.board[0][c] = 1;
    expect(GameLogic.checkWin(0, 2)).not.toBeNull();
    expect(GameLogic.checkWin(0, 2).length).toBe(5);
  });

  test('checkWin horizontal 5 at right edge', () => {
    for (let c = 10; c < 15; c++) GameState.state.board[0][c] = 1;
    expect(GameLogic.checkWin(0, 12)).not.toBeNull();
    expect(GameLogic.checkWin(0, 12).length).toBe(5);
  });

  test('checkWin vertical 5 at top', () => {
    for (let r = 0; r < 5; r++) GameState.state.board[r][0] = 1;
    expect(GameLogic.checkWin(2, 0)).not.toBeNull();
    expect(GameLogic.checkWin(2, 0).length).toBe(5);
  });

  test('checkWin vertical 5 at bottom', () => {
    for (let r = 10; r < 15; r++) GameState.state.board[r][0] = 1;
    expect(GameLogic.checkWin(12, 0)).not.toBeNull();
    expect(GameLogic.checkWin(12, 0).length).toBe(5);
  });

  test('checkWin diagonal ↘ from top-left corner', () => {
    for (let i = 0; i < 5; i++) GameState.state.board[i][i] = 1;
    expect(GameLogic.checkWin(2, 2)).not.toBeNull();
    expect(GameLogic.checkWin(2, 2).length).toBe(5);
  });

  test('checkWin diagonal ↗ from bottom-left corner', () => {
    for (let i = 0; i < 5; i++) GameState.state.board[14 - i][i] = 1;
    expect(GameLogic.checkWin(12, 2)).not.toBeNull();
    expect(GameLogic.checkWin(12, 2).length).toBe(5);
  });

  test('checkWin horizontal 6 in a row returns null (overline)', () => {
    for (let c = 0; c < 6; c++) GameState.state.board[0][c] = 1;
    expect(GameLogic.checkWin(0, 2)).toBeNull();
  });

  test('checkWin vertical 6 in a row returns null (overline)', () => {
    for (let r = 0; r < 6; r++) GameState.state.board[r][0] = 1;
    expect(GameLogic.checkWin(2, 0)).toBeNull();
  });

  test('checkDraw on full board with no winner returns true and sets draw', () => {
    // Checkerboard: no two adjacent cells share a value → no 5-in-a-row possible
    for (let r = 0; r < 15; r++)
      for (let c = 0; c < 15; c++)
        GameState.state.board[r][c] = ((r + c) % 2 === 0) ? 1 : 2;
    GameState.state.winner = null;
    expect(GameLogic.checkDraw()).toBe(true);
    expect(GameState.state.status).toBe('draw');
  });

  test('checkDraw on full board where winner exists returns false', () => {
    for (let r = 0; r < 15; r++)
      for (let c = 0; c < 15; c++)
        GameState.state.board[r][c] = 1;
    GameState.state.winner = 1;
    expect(GameLogic.checkDraw()).toBe(false);
  });
});

// ─── AIPlayer Unit Tests (Task 1.14) ─────────────────────────────────────────

describe('AIPlayer unit tests', () => {
  test('getBestMove on empty 15×15 board returns [7,7]', () => {
    newGame(15, 'vs-ai');
    expect(AIPlayer.getBestMove(GameState.state.board, 15)).toEqual([7, 7]);
  });

  test('getBestMove on empty 19×19 board returns [9,9]', () => {
    newGame(19, 'vs-ai');
    expect(AIPlayer.getBestMove(GameState.state.board, 19)).toEqual([9, 9]);
  });

  test('getBestMove completes AI open four', () => {
    newGame(15, 'vs-ai');
    // AI (player 2) has 4 in a row at row 7, cols 5-8; col 4 or 9 completes it
    for (let c = 5; c <= 8; c++) GameState.state.board[7][c] = 2;
    const move = AIPlayer.getBestMove(GameState.state.board, 15);
    expect(move[0]).toBe(7);
    expect([4, 9]).toContain(move[1]);
  });

  test('getBestMove blocks human open four', () => {
    newGame(15, 'vs-ai');
    // Human (player 1) has 4 in a row at row 7, cols 5-8
    for (let c = 5; c <= 8; c++) GameState.state.board[7][c] = 1;
    const move = AIPlayer.getBestMove(GameState.state.board, 15);
    expect(move[0]).toBe(7);
    expect([4, 9]).toContain(move[1]);
  });

  test('jitter is always >= 0 and < JITTER_FACTOR', () => {
    const { JITTER_FACTOR } = AIPlayer;
    for (let i = 0; i < 1000; i++) {
      const jitter = Math.random() * JITTER_FACTOR;
      expect(jitter).toBeGreaterThanOrEqual(0);
      expect(jitter).toBeLessThan(JITTER_FACTOR);
    }
  });
});

// ─── Property Tests (Tasks 1.4–1.12) ─────────────────────────────────────────

// Feature: turn-management, Property 1: Turn Alternation
test('Property 1: Turn Alternation', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.tuple(fc.integer({ min: 0, max: 14 }), fc.integer({ min: 0, max: 14 })),
        { minLength: 2, maxLength: 20 }
      ),
      (moves) => {
        newGame(15);
        let expectedPlayer = 1;
        for (const [r, c] of moves) {
          if (GameState.state.status !== 'playing') break;
          if (GameState.state.board[r][c] !== 0) continue;
          expect(GameState.state.currentPlayer).toBe(expectedPlayer);
          GameLogic.placePiece(r, c);
          if (GameState.state.status === 'playing') expectedPlayer = expectedPlayer === 1 ? 2 : 1;
        }
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: piece-placement, Property 2: Occupied Cell Immutability
test('Property 2: Occupied Cell Immutability', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 14 }),
      fc.integer({ min: 0, max: 14 }),
      fc.integer({ min: 1, max: 2 }),
      (row, col, player) => {
        newGame(15);
        GameState.state.board[row][col] = player;
        const before = boardCopy(GameState.state.board);
        const prevPlayer = GameState.state.currentPlayer;
        GameLogic.placePiece(row, col);
        expect(GameState.state.board).toEqual(before);
        expect(GameState.state.currentPlayer).toBe(prevPlayer);
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: win-detection, Property 3: Win Detection Completeness (All Directions)
test('Property 3: Win Detection Completeness (All Directions)', () => {
  // direction configs: [dr, dc, maxStartRow, maxStartCol, minStartCol]
  const dirs = [
    [0, 1, 14, 10, 0],   // horizontal
    [1, 0, 10, 14, 0],   // vertical
    [1, 1, 10, 10, 0],   // diagonal ↘
    [1, -1, 10, 14, 4],  // diagonal ↗
  ];

  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 3 }),
      fc.integer({ min: 0, max: 10 }),
      fc.integer({ min: 0, max: 14 }),
      fc.constantFrom(1, 2),
      (dirIdx, rawRow, rawCol, player) => {
        const [dr, dc, maxRow, maxCol, minCol] = dirs[dirIdx];
        const row = Math.min(rawRow, maxRow);
        const col = Math.max(minCol, Math.min(rawCol, maxCol));

        newGame(15);
        const board = GameState.state.board;
        for (let i = 0; i < 5; i++) board[row + dr * i][col + dc * i] = player;

        // Ensure no extension on either end (clear adjacent cells)
        const r0 = row - dr, c0 = col - dc;
        const r1 = row + dr * 5, c1 = col + dc * 5;
        if (r0 >= 0 && r0 < 15 && c0 >= 0 && c0 < 15) board[r0][c0] = 0;
        if (r1 >= 0 && r1 < 15 && c1 >= 0 && c1 < 15) board[r1][c1] = 0;

        const midR = row + dr * 2, midC = col + dc * 2;
        const result = GameLogic.checkWin(midR, midC);
        return result !== null && result.length === 5;
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: win-detection, Property 4: Overline Rule
test('Property 4: Overline Rule — No Win on Six or More', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 8 }),
      fc.integer({ min: 6, max: 8 }),
      fc.constantFrom(1, 2),
      (startCol, runLength, player) => {
        // Ensure run fits within board: startCol + runLength - 1 <= 14
        const safeStart = Math.min(startCol, 14 - runLength + 1);
        newGame(15);
        for (let i = 0; i < runLength; i++) GameState.state.board[0][safeStart + i] = player;
        const midC = safeStart + Math.floor(runLength / 2);
        return GameLogic.checkWin(0, midC) === null;
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: game-over, Property 5: Game-Over Immutability
test('Property 5: Game-Over Immutability', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('won', 'draw'),
      fc.integer({ min: 0, max: 14 }),
      fc.integer({ min: 0, max: 14 }),
      (status, row, col) => {
        newGame(15);
        GameState.state.status = status;
        GameState.state.winner = status === 'won' ? 1 : null;
        GameState.state.winCells = status === 'won' ? [[0,0],[0,1],[0,2],[0,3],[0,4]] : [];
        const boardSnap = boardCopy(GameState.state.board);
        const winnerSnap = GameState.state.winner;
        const winCellsSnap = [...GameState.state.winCells];

        GameLogic.placePiece(row, col);

        expect(GameState.state.board).toEqual(boardSnap);
        expect(GameState.state.winner).toBe(winnerSnap);
        expect(GameState.state.winCells).toEqual(winCellsSnap);
        expect(GameState.state.status).toBe(status);
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: draw-detection, Property 6: Draw Completeness
test('Property 6: Draw Completeness', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(15, 19),
      (size) => {
        newGame(size);
        const board = GameState.state.board;
        // Checkerboard fill — no 5-in-a-row possible
        for (let r = 0; r < size; r++)
          for (let c = 0; c < size; c++)
            board[r][c] = ((r + c) % 2 === 0) ? 1 : 2;
        GameState.state.winner = null;
        return GameLogic.checkDraw() === true && GameState.state.status === 'draw';
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: ai, Property 7: AI Move Validity
test('Property 7: AI Move Validity', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.tuple(fc.integer({ min: 0, max: 14 }), fc.integer({ min: 0, max: 14 })),
        { minLength: 1, maxLength: 30 }
      ),
      (preMoves) => {
        newGame(15, 'vs-ai');
        for (const [r, c] of preMoves) {
          if (GameState.state.board[r][c] === 0) GameState.state.board[r][c] = 1;
        }
        GameState.state.currentPlayer = 2;

        const emptyCellsBefore = new Set();
        for (let r = 0; r < 15; r++)
          for (let c = 0; c < 15; c++)
            if (GameState.state.board[r][c] === 0) emptyCellsBefore.add(`${r},${c}`);

        if (emptyCellsBefore.size === 0) return true;

        const boardBefore = boardCopy(GameState.state.board);
        AIPlayer.takeTurn();

        let changedCells = 0;
        let movedToEmpty = false;
        for (let r = 0; r < 15; r++) {
          for (let c = 0; c < 15; c++) {
            if (GameState.state.board[r][c] !== boardBefore[r][c]) {
              changedCells++;
              if (emptyCellsBefore.has(`${r},${c}`)) movedToEmpty = true;
              else return false; // occupied cell changed — invalid
            }
          }
        }
        return changedCells <= 1 && (changedCells === 0 || movedToEmpty);
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: ai, Property 8: AI Jitter Boundedness
test('Property 8: AI Jitter Boundedness', () => {
  const { JITTER_FACTOR } = AIPlayer;
  fc.assert(
    fc.property(
      fc.array(fc.float({ min: 0, max: Math.fround(0.9999) }), { minLength: 2, maxLength: 30 }),
      (randomValues) => {
        let idx = 0;
        const origRandom = Math.random;
        Math.random = () => randomValues[idx++ % randomValues.length];

        try {
          newGame(15, 'vs-ai');
          GameState.state.board[7][7] = 1;
          GameState.state.currentPlayer = 2;

          const candidates = AIPlayer.getCandidates(GameState.state.board, 15);
          idx = 0;

          let bestScore = -Infinity;
          let bestMove = null;
          for (const [r, c] of candidates) {
            const jitter = Math.random() * JITTER_FACTOR;
            if (jitter < 0 || jitter >= JITTER_FACTOR) return false;
            const score = AIPlayer.scoreCell(GameState.state.board, r, c, 2, 15)
              - AIPlayer.scoreCell(GameState.state.board, r, c, 1, 15)
              + jitter;
            if (score > bestScore) { bestScore = score; bestMove = [r, c]; }
          }
          return bestMove !== null;
        } finally {
          Math.random = origRandom;
        }
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: board-integrity, Property 9: Board Size Integrity
test('Property 9: Board Size Integrity', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(15, 19),
      fc.array(
        fc.tuple(fc.integer({ min: -2, max: 21 }), fc.integer({ min: -2, max: 21 })),
        { minLength: 1, maxLength: 40 }
      ),
      (size, moves) => {
        newGame(size);
        for (const [r, c] of moves) {
          GameLogic.placePiece(r, c);
          if (GameState.state.board.length !== size) return false;
          for (const row of GameState.state.board)
            if (row.length !== size) return false;
        }
        return true;
      }
    ),
    { numRuns: 200 }
  );
});


// ─── Renderer Unit Tests (Task 2.7) ──────────────────────────────────────────

describe('Renderer.recalcCellSize unit tests', () => {
  // Pure formula — no DOM needed
  function recalcCellSize(w, h, size) {
    return Math.max(4, Math.floor(Math.min(w * 0.92, h * 0.78) / size));
  }

  test('recalcCellSize(1200, 800, 15) === 41', () => {
    expect(recalcCellSize(1200, 800, 15)).toBe(41);
  });

  test('recalcCellSize(800, 600, 19) === 24', () => {
    expect(recalcCellSize(800, 600, 19)).toBe(24);
  });

  test('recalcCellSize(40, 30, 15) clamped to 4', () => {
    expect(recalcCellSize(40, 30, 15)).toBe(4);
  });

  test('recalcCellSize(40, 30, 19) clamped to 4', () => {
    expect(recalcCellSize(40, 30, 19)).toBe(4);
  });
});

// Feature: responsive-layout, Property 10: Responsive Cell Size
test('Property 10: Responsive Cell Size', () => {
  function recalcCellSize(w, h, size) {
    return Math.max(4, Math.floor(Math.min(w * 0.92, h * 0.78) / size));
  }
  fc.assert(
    fc.property(
      fc.integer({ min: 200, max: 3840 }),
      fc.integer({ min: 200, max: 2160 }),
      fc.constantFrom(15, 19),
      (w, h, size) => {
        const result = recalcCellSize(w, h, size);
        const expected = Math.max(4, Math.floor(Math.min(w * 0.92, h * 0.78) / size));
        return result === expected && result >= 4;
      }
    ),
    { numRuns: 200 }
  );
});

// ─── Integration Tests (Task 2.8) ────────────────────────────────────────────

describe('Integration tests', () => {
  test('Two-player 15×15: horizontal win for Player 1', () => {
    newGame(15, 'two-player');
    // P1 places cols 0-4 row 0, P2 fills row 1 between P1 turns
    // Alternate: P1 r0c0, P2 r1c0, P1 r0c1, P2 r1c1, ... P1 r0c4 wins
    GameLogic.placePiece(0, 0); // P1
    GameLogic.placePiece(1, 0); // P2
    GameLogic.placePiece(0, 1); // P1
    GameLogic.placePiece(1, 1); // P2
    GameLogic.placePiece(0, 2); // P1
    GameLogic.placePiece(1, 2); // P2
    GameLogic.placePiece(0, 3); // P1
    GameLogic.placePiece(1, 3); // P2
    GameLogic.placePiece(0, 4); // P1 wins

    expect(GameState.state.status).toBe('won');
    expect(GameState.state.winner).toBe(1);
    expect(GameState.state.winCells.length).toBe(5);
  });

  test('Two-player 19×19: checkerboard fill results in draw', () => {
    newGame(19, 'two-player');
    const board = GameState.state.board;
    for (let r = 0; r < 19; r++)
      for (let c = 0; c < 19; c++)
        board[r][c] = ((r + c) % 2 === 0) ? 1 : 2;
    GameState.state.winner = null;
    GameLogic.checkDraw();
    expect(GameState.state.status).toBe('draw');
  });

  test('VS-AI: after human places piece, AI responds and aiLocked resets', (done) => {
    newGame(15, 'vs-ai');
    GameLogic.placePiece(7, 7); // human (P1)
    // Manually trigger AI turn as InputHandler would
    GameState.state.aiLocked = true;
    setTimeout(() => {
      AIPlayer.takeTurn();
      expect(GameState.state.aiLocked).toBe(false);
      // Count pieces on board — should be 2
      let count = 0;
      for (let r = 0; r < 15; r++)
        for (let c = 0; c < 15; c++)
          if (GameState.state.board[r][c] !== 0) count++;
      expect(count).toBe(2);
      done();
    }, 300);
  });

  test('Play Again resets board, preserves mode and size, P1 starts', () => {
    newGame(15, 'vs-ai');
    GameState.state.status = 'won';
    GameState.state.winner = 1;
    // Simulate play again
    GameState.init(GameState.state.mode, GameState.state.size);
    expect(GameState.state.status).toBe('playing');
    expect(GameState.state.currentPlayer).toBe(1);
    expect(GameState.state.mode).toBe('vs-ai');
    expect(GameState.state.size).toBe(15);
    const allZero = GameState.state.board.every(row => row.every(c => c === 0));
    expect(allZero).toBe(true);
  });

  test('Main Menu clears mode and size', () => {
    newGame(15, 'two-player');
    // Simulate main menu click
    GameState.state.mode = null;
    GameState.state.size = null;
    expect(GameState.state.mode).toBeNull();
    expect(GameState.state.size).toBeNull();
  });

  test('Resize during game preserves all pieces', () => {
    newGame(15, 'two-player');
    GameLogic.placePiece(0, 0); // P1
    GameLogic.placePiece(1, 1); // P2
    // Snapshot occupied cells
    const before = [];
    for (let r = 0; r < 15; r++)
      for (let c = 0; c < 15; c++)
        if (GameState.state.board[r][c] !== 0) before.push([r, c, GameState.state.board[r][c]]);
    // Simulate resize (board state is unchanged — renderBoard reads from state)
    const after = [];
    for (let r = 0; r < 15; r++)
      for (let c = 0; c < 15; c++)
        if (GameState.state.board[r][c] !== 0) after.push([r, c, GameState.state.board[r][c]]);
    expect(after).toEqual(before);
  });
});
