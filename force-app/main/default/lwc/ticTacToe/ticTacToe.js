import { LightningElement, track } from 'lwc';

export default class TicTacToe extends LightningElement {
    @track cells = []; // Cells for the game board
    currentPlayer = 1; // Start with Player 1
    history = []; // Track game history
    stepNumber = 0; // Track the current step in the game

    connectedCallback() {
        this.handleReset();
    }

    handleReset() {
        // Initialize the game state with empty squares and set the first player to 'X'
        this.history = [{
            squares: Array(9).fill(null),
            xIsNext: true,
            move: null,
            when: Date.now(),
        }];
        this.stepNumber = 0;

        // Reset the cells
        this.cells = [
            { id: 'cell1', name: 'cell1', classes: 'turn-1 player-1 first-row first-column', labelClasses: 'top left', labelKey: 'cell1-label' },
            { id: 'cell2', name: 'cell2', classes: 'turn-2 player-2 first-row second-column', labelClasses: 'top middle', labelKey: 'cell2-label' },
            { id: 'cell3', name: 'cell3', classes: 'turn-3 player-1 first-row third-column', labelClasses: 'top right', labelKey: 'cell3-label' },
            { id: 'cell4', name: 'cell4', classes: 'turn-4 player-2 second-row first-column', labelClasses: 'center left', labelKey: 'cell4-label' },
            { id: 'cell5', name: 'cell5', classes: 'turn-5 player-1 second-row second-column', labelClasses: 'center middle', labelKey: 'cell5-label' },
            { id: 'cell6', name: 'cell6', classes: 'turn-6 player-2 second-row third-column', labelClasses: 'center right', labelKey: 'cell6-label' },
            { id: 'cell7', name: 'cell7', classes: 'turn-7 player-1 third-row first-column', labelClasses: 'bottom left', labelKey: 'cell7-label' },
            { id: 'cell8', name: 'cell8', classes: 'turn-8 player-2 third-row second-column', labelClasses: 'bottom middle', labelKey: 'cell8-label' },
            { id: 'cell9', name: 'cell9', classes: 'turn-9 player-1 third-row third-column', labelClasses: 'bottom right', labelKey: 'cell9-label' },
        ];

        // Hide the end screen
        const endScreen = this.template.querySelector('.end');
        if (endScreen) {
            endScreen.style.display = 'none';
        }

        // Reset the current player to Player 1
        this.currentPlayer = 1;
    }

    handleClick(event) {
        const clickedCell = event.target;

        // Ensure that the clicked cell is empty and valid
        if (!clickedCell.checked) {
            // Mark the cell as checked for the current player
            clickedCell.checked = true;
            
            // Determine current player's classes
            const playerClass = `player-${this.currentPlayer}`;
            clickedCell.classList.add(playerClass);

            // Check for a winner
            if (this.checkWinner(this.currentPlayer)) {
                this.showEndScreen(`Player ${this.currentPlayer} wins!`);
            } else if (this.isTie()) {
                this.showEndScreen("It's a tie!");
            } else {
                // Toggle to the next player
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            }
        }
    }

    checkWinner(player) {
        // Winning combinations for Tic-Tac-Toe
        const winningCombinations = [
            ['cell1', 'cell2', 'cell3'],
            ['cell4', 'cell5', 'cell6'],
            ['cell7', 'cell8', 'cell9'],
            ['cell1', 'cell4', 'cell7'],
            ['cell2', 'cell5', 'cell8'],
            ['cell3', 'cell6', 'cell9'],
            ['cell1', 'cell5', 'cell9'],
            ['cell3', 'cell5', 'cell7'],
        ];

        // Check each combination to see if the current player has won
        return winningCombinations.some(combination => {
            return combination.every(cellId => {
                const cell = this.template.querySelector(`input[id="${cellId}"]`);
                return cell && cell.checked && cell.classList.contains(`player-${player}`);
            });
        });
    }

    isTie() {
        // Check if all cells are checked and there is no winner
        return this.cells.every(cell => {
            const cellInput = this.template.querySelector(`input[id="${cell.id}"]`);
            return cellInput && cellInput.checked;
        });
    }

    showEndScreen(message) {
        // Display the end screen with the result message
        const endScreen = this.template.querySelector('.end');
        const winMessage = endScreen.querySelector('h3');

        winMessage.textContent = message;
        endScreen.style.display = 'block';
    }
}