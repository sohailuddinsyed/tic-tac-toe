'use strict';

const { GameState } = require('./gameState');

const GameLogic = (() => {
  const DIRS = [[0,1],[1,0],[1,1],[1,-1]];

  function checkWin(row, col) {
    const { board, size } = GameState.state;
    const player = board[row][col];

    for (const [dr, dc] of DIRS) {
      let fwd = 0, bck = 0;
      for (let i = 1; i < size; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
        fwd++;
      }
      for (let i = 1; i < size; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
        bck++;
      }
      if (fwd + bck + 1 === 5) {
        const cells = [];
        for (let i = -bck; i <= fwd; i++) cells.push([row + dr * i, col + dc * i]);
        return cells;
      }
    }
    return null;
  }

  function checkDraw() {
    const { board, size, winner } = GameState.state;
    if (winner !== null) return false;
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (board[r][c] === 0) return false;
    GameState.state.status = 'draw';
    return true;
  }

  function nextTurn() {
    GameState.state.currentPlayer = GameState.state.currentPlayer === 1 ? 2 : 1;
  }

  function placePiece(row, col) {
    const state = GameState.state;
    if (state.status !== 'playing') return;
    if (row < 0 || row >= state.size || col < 0 || col >= state.size) return;
    if (state.board[row][col] !== 0) return;

    state.board[row][col] = state.currentPlayer;

    const winCells = checkWin(row, col);
    if (winCells) {
      state.status = 'won';
      state.winner = state.currentPlayer;
      state.winCells = winCells;
      return;
    }
    if (checkDraw()) return;
    nextTurn();
  }

  return { placePiece, checkWin, checkDraw, nextTurn };
})();

if (typeof module !== 'undefined') module.exports = { GameLogic };
