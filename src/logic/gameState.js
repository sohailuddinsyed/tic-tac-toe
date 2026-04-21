'use strict';

const GameState = (() => {
  const state = {
    mode: null,
    size: null,
    board: [],
    currentPlayer: 1,
    status: 'idle',
    winner: null,
    winCells: [],
    aiLocked: false
  };

  function init(mode, size) {
    const n = (size === 19) ? 19 : 15;
    state.mode = mode;
    state.size = n;
    state.board = Array.from({ length: n }, () => new Array(n).fill(0));
    state.currentPlayer = 1;
    state.status = 'playing';
    state.winner = null;
    state.winCells = [];
    state.aiLocked = false;
  }

  return { state, init };
})();

if (typeof module !== 'undefined') module.exports = { GameState };
