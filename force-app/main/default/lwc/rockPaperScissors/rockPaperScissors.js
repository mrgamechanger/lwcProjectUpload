import { LightningElement, track } from 'lwc';

export default class RockPaperScissors extends LightningElement {
    @track playerChoice = '';
    @track computerChoice = '';
    @track result = '';
    @track playerScore = 0;
    @track computerScore = 0;

    choices = ['rock', 'paper', 'scissors'];

    handlePlayerChoice(event) {
        this.playerChoice = event.target.value;
        this.computerChoice = this.getComputerChoice();
        this.determineWinner();
    }

    getComputerChoice() {
        return this.choices[Math.floor(Math.random() * this.choices.length)];
    }

    determineWinner() {
        if (this.playerChoice === this.computerChoice) {
            this.result = 'It\'s a tie!';
        } else if (
            (this.playerChoice === 'rock' && this.computerChoice === 'scissors') ||
            (this.playerChoice === 'paper' && this.computerChoice === 'rock') ||
            (this.playerChoice === 'scissors' && this.computerChoice === 'paper')
        ) {
            this.result = 'You win!';
            this.playerScore++;
        } else {
            this.result = 'Computer wins!';
            this.computerScore++;
        }
    }
}