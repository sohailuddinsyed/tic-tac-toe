# Requirements Document

## Introduction
This document describes a browser-based Connect 5 game built as a single HTML file with no dependencies. The game supports local two-player mode and a solo vs-AI mode on a 15×15 or 19×19 grid. The target user is a desktop player who wants a premium, futuristic game experience.

## Glossary
- **Connect 5**: A two-player strategy game where the goal is to place five of your pieces in an unbroken row — horizontally, vertically, or diagonally — before your opponent does.
- **Board**: The grid on which pieces are placed. Either 15×15 or 19×19 cells.
- **Cell**: A single intersection point on the board where a piece can be placed.
- **Piece**: A player's marker placed on a cell. Player 1 uses one color, Player 2 (or AI) uses another.
- **Two-Player Mode**: Both players share the same device and take turns clicking to place pieces.
- **VS-AI Mode**: One human player competes against an AI opponent.
- **AI**: The computer-controlled opponent that plays at a human-like level — generally competent but capable of mistakes.
- **Win Condition**: Five pieces of the same player in an unbroken line (horizontal, vertical, or diagonal).
- **Draw**: All cells are filled with no winner.
- **Main Menu**: The initial screen where the player selects game mode.
- **Mode Selection**: The step where the player chooses Two-Player or VS-AI.
- **Size Selection**: The step where the player chooses 15×15 or 19×19.
- **End Screen**: The screen shown after a game concludes, offering replay or menu options.

## Requirements

### Requirement 1: Main Menu

**User Story:** As a player, I want a main menu screen, so that I can choose how I want to play before the game starts.

#### Acceptance Criteria
1. WHEN the game loads, THE system SHALL display a main menu with two options: "Two Player" and "VS AI".
2. WHEN the player selects a mode, THE system SHALL advance to the size selection screen.

---

### Requirement 2: Size Selection

**User Story:** As a player, I want to choose the board size, so that I can control the length and complexity of the game.

#### Acceptance Criteria
1. WHEN the player has selected a mode, THE system SHALL display a size selection screen with two options: 15×15 and 19×19.
2. WHEN the player selects a size, THE system SHALL start a new game with the chosen mode and board size.

---

### Requirement 3: Two-Player Mode

**User Story:** As a player, I want to play against another person on the same device, so that I can compete with a friend locally.

#### Acceptance Criteria
1. THE system SHALL alternate turns between Player 1 and Player 2 starting with Player 1.
2. WHEN a player clicks an empty cell on their turn, THE system SHALL place that player's piece on the cell.
3. WHEN a player clicks an occupied cell, THE system SHALL ignore the click and not change the game state.
4. THE system SHALL clearly indicate whose turn it is at all times during play.

---

### Requirement 4: VS-AI Mode

**User Story:** As a player, I want to play against an AI opponent, so that I can enjoy a solo game.

#### Acceptance Criteria
1. THE system SHALL assign the human player as Player 1 and the AI as Player 2.
2. WHEN it is the AI's turn, THE system SHALL automatically place a piece without requiring human input.
3. THE system SHALL prevent the human player from placing a piece while the AI is taking its turn.
4. THE system SHALL implement the AI using a scored move strategy where a small random jitter is added to each candidate move's score before selection, so the AI plays competently but occasionally picks a suboptimal move the way a human would.

---

### Requirement 5: Win Detection

**User Story:** As a player, I want the game to detect when someone wins, so that the game ends correctly.

#### Acceptance Criteria
1. WHEN a player places a piece that creates an unbroken line of exactly five of their pieces horizontally (not six or more), THE system SHALL declare that player the winner.
2. WHEN a player places a piece that creates an unbroken line of exactly five of their pieces vertically (not six or more), THE system SHALL declare that player the winner.
3. WHEN a player places a piece that creates an unbroken line of exactly five of their pieces diagonally (not six or more), THE system SHALL declare that player the winner.
4. WHEN a winner is declared, THE system SHALL immediately end the game and display the end screen.

---

### Requirement 6: Draw Detection

**User Story:** As a player, I want the game to detect a draw, so that the game ends when no moves remain.

#### Acceptance Criteria
1. WHEN all cells are filled and no player has won, THE system SHALL declare the game a draw.
2. WHEN a draw is declared, THE system SHALL display the end screen indicating a draw.

---

### Requirement 7: End Screen

**User Story:** As a player, I want to see the game result and choose what to do next, so that I can replay or start fresh.

#### Acceptance Criteria
1. WHEN the game ends, THE system SHALL display the outcome: which player won, or that the game is a draw.
2. WHEN the end screen is shown, THE system SHALL offer a "Play Again" option that restarts the game with the same mode and board size.
3. WHEN the end screen is shown, THE system SHALL offer a "Main Menu" option that returns to the main menu and resets all selections.

---

### Requirement 8: Premium Futuristic UI

**User Story:** As a player, I want the game to look modern and high-end, so that the experience feels polished and premium.

#### Acceptance Criteria
1. THE system SHALL use a dark, futuristic visual theme with a cohesive color palette throughout all screens.
2. THE system SHALL use smooth CSS transitions or animations for piece placement, screen transitions, and interactive elements.
3. THE system SHALL render the board and pieces in a visually distinctive, high-quality style — not plain HTML elements.
4. THE system SHALL display hover states on empty cells to indicate where a piece will be placed.
5. THE system SHALL highlight the winning five cells visually when a win is detected.

---

### Requirement 9: Technical Constraints

**User Story:** As a developer, I want the game to be self-contained, so that it runs anywhere without setup.

#### Acceptance Criteria
1. THE system SHALL be implemented as a single HTML file with no external dependencies.
2. THE system SHALL use only vanilla JavaScript with no frameworks or libraries.
3. THE system SHALL function correctly in modern desktop browsers (Chrome, Firefox, Safari, Edge).
4. THE system SHALL require no build step, server, or installation to run.
5. WHEN the browser window is resized, THE system SHALL responsively resize the board and all UI elements to fit the new viewport without requiring a page reload.
