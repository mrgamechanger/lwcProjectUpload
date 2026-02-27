import { LightningElement, track } from 'lwc';
import getScores from '@salesforce/apex/ChallengeOfTheDay.getScores';
import getScoresByParticipant from '@salesforce/apex/ChallengeOfTheDay.getScoresByParticipant';

const columns = [
    { label: 'Rank', fieldName: 'rank', type: 'number',fixedWidth: 200 },
    { label: 'Name', fieldName: 'nameUrl', type: 'url', typeAttributes: { label: { fieldName: 'name' }, target: '_blank' },fixedWidth: 800 }, 
    { label: 'Score', fieldName: 'score', type: 'text' ,fixedWidth: 200 },
    {
        label: 'Actions',
        type: 'button',
        typeAttributes: {
            label: 'View Details',
            name: 'view_details',
            title: 'Click to View Details',
            disabled: false,
            value: 'view_details',
            iconPosition: 'right'
        },
        flex: 2
    }
];
export default class ChallengeOfTheDayCompetitionScores extends LightningElement {
    @track data = [];
    @track columns = columns;
    @track error;
    @track results = [];
    @track isLoading = false;
    @track enableInfiniteLoading = true;
    @track selectedParticipantName; // Store selected participant's name
    @track scoresPerChallenge = []; // Array to store scores per challenge
    @track isModalOpen = false; // Track modal open state
    showWarning = true;
    scoreParticipantName; // for showing it on the modal title

    rowLimit = 50; // we can adjust the row limit as needed
    rowOffSet = 0;

    connectedCallback() {
        this.loadData();
    }

    async loadData() {
        this.isLoading = true;
        try {
            const data = await getScores({ limitSize: this.rowLimit, offset: this.rowOffSet });
            if(data != null) {
                this.processData(data);
                this.rowOffSet += this.rowLimit;
                this.enableInfiniteLoading = data.length === this.rowLimit; // Continue loading if there are more records
            }
            else
                this.showWarning = true;
        } catch (error) {
            console.error(error);
            this.results = null;
        } finally {
            this.isLoading = false;
        }
    }

    processData(data) {
        let tempResultsMap = new Map();
    
        data.forEach(record => {
            const profileUrl = record.Challenge_of_the_Day_Participant__r.Linkedin_Profile_URL__c;
            const name = record.Challenge_of_the_Day_Participant__r.Name;
            const score = record.Score__c;
    
            // Check if both profileUrl and name are already in the tempResultsMap
            let existingEntry = [...tempResultsMap.values()].find(entry => entry.nameUrl === profileUrl && entry.name === name);
    
            if (existingEntry) {
                // Update existing entry in tempResultsMap
                existingEntry.score += score;
            } else {
                // Check if an entry with the same name already exists in this.results
                const existingEntryInResults = this.results.find(result => result.name === name);
                if (existingEntryInResults) {
                    // Update the existing entry in this.results
                    existingEntryInResults.score += score;
                } else {
                    // Add new entry to tempResultsMap
                    tempResultsMap.set(profileUrl + name, {
                        rank: 0,
                        name: name,
                        nameUrl: profileUrl,
                        score: score
                    });
                }
            }
        });
    
        // Convert map to array and merge with this.results
        this.results = [...this.results, ...Array.from(tempResultsMap.values())];
    
        // Sort results by score in descending order
        this.results.sort((a, b) => b.score - a.score);
    
        // Assign ranks after sorting
        for (let i = 0; i < this.results.length; i++) {
            this.results[i].rank = i + 1;
        }
    }

    compare(a, b) {
        return b.score - a.score;
    }

    loadMoreData(event) {
        if (this.enableInfiniteLoading && !this.isLoading) {
            this.loadData();
        }
        event.target.isLoading = this.isLoading;
    }

    async handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
    
        if (actionName === 'view_details') {
            // Fetch scores per challenge for the selected participant
            this.selectedParticipantName = row.name; // Store selected participant's name
            await this.fetchScoresByParticipant(this.selectedParticipantName);
            this.isModalOpen = true; // Open the modal
        }
    }
    
    async fetchScoresByParticipant(participantName) {
        try {
            this.scoreParticipantName = participantName;
            const response = await getScoresByParticipant({ participantName: participantName });
            if (response && response.length > 0) {
                this.scoresPerChallenge = response.map(result => {
                    let challengeNumber = parseInt(result.Challenge_of_the_Day_Challenge__r.Name.replace('#', '').replace(/^0+/, ''), 10);
                    if (isNaN(challengeNumber)) {
                        challengeNumber = 0;
                    }
                    const challengeName = `Challenge of the Day #${challengeNumber}`;
                    return {
                        challengeName: challengeName,
                        score: result.Score__c
                    };
                }).sort((a, b) => {
                    const num1 = parseInt(a.challengeName.split('#')[1]) || 0;
                    const num2 = parseInt(b.challengeName.split('#')[1]) || 0;
                    return num1 - num2;
                });
            } else {
                this.scoresPerChallenge = [];
            }
        } catch (error) {
            console.error('Error fetching scores per challenge:', error);
            this.scoresPerChallenge = [];
        }
    }
    
    
    handleModalClose() {
        this.isModalOpen = false;
    }
}