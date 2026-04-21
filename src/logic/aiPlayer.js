'use strict';

const { GameState } = require('./gameState');
const { GameLogic } = require('./gameLogic');

const AIPlayer = (() => {
  const JITTER_FACTOR = 800;
  const W = { open4: 100000, blocked4: 10000, open3: 5000, blocked3: 500, open2: 200, single: 10 };
  const DIRS = [[0,1],[1,0],[1,1],[1,-1]];

  function getCandidates(board, size) {
    const occupied = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (board[r][c] !== 0) occupied.push([r, c]);

    if (occupied.length === 0) return [[Math.floor(size / 2), Math.floor(size / 2)]];

    const seen = new Set();
    const candidates = [];
    for (const [or, oc] of occupied) {
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = or + dr, c = oc + dc;
          if (r < 0 || r >= size || c < 0 || c >= size) continue;
          if (board[r][c] !== 0) continue;
          const key = r * size + c;
          if (!seen.has(key)) { seen.add(key); candidates.push([r, c]); }
        }
      }
    }
    return candidates;
  }

  function scoreCell(board, row, col, player, size) {
    let total = 0;
    for (const [dr, dc] of DIRS) {
      let count = 1;
      let openFwd = false, openBck = false;
      for (let i = 1; i < 6; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        if (board[r][c] === player) count++;
        else { if (board[r][c] === 0) openFwd = true; break; }
      }
      for (let i = 1; i < 6; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        if (board[r][c] === player) count++;
        else { if (board[r][c] === 0) openBck = true; break; }
      }
      const open = openFwd && openBck;
      if (count >= 4) total += open ? W.open4 : W.blocked4;
      else if (count === 3) total += open ? W.open3 : W.blocked3;
      else if (count === 2) total += open ? W.open2 : W.single;
      else total += W.single;
    }
    return total;
  }

  function getBestMove(board, size) {
    const candidates = getCandidates(board, size);
    let best = null, bestScore = -Infinity;
    for (const [r, c] of candidates) {
      const score = scoreCell(board, r, c, 2, size) + scoreCell(board, r, c, 1, size) + Math.random() * JITTER_FACTOR;
      if (score > bestScore) { bestScore = score; best = [r, c]; }
    }
    return best;
  }

  function takeTurn() {
    const state = GameState.state;
    state.aiLocked = true;
    const move = getBestMove(state.board, state.size);
    if (move) GameLogic.placePiece(move[0], move[1]);
    state.aiLocked = false;
  }

  return { getCandidates, scoreCell, getBestMove, takeTurn, JITTER_FACTOR };
})();

if (typeof module !== 'undefined') module.exports = { AIPlayer };
