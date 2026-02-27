import { LightningElement, api } from 'lwc';

export default class ChallengeOfTheDayCompetitionScoreModal extends LightningElement {
    @api isOpen;
    @api participantName;
    @api scores;
    totalScore;

    renderedCallback() {
        this.totalScore = (this.scores.map(item => item.score)).reduce(function(result, sco) {
            return result + sco;
        }, 0);
    }

    handleClose() {
        this.isOpen = false;
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }
}