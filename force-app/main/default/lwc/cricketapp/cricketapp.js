import { LightningElement,track } from 'lwc';
import getCricScore from '@salesforce/apex/CricApiController.getCricScore';
import getCurrentMatches from '@salesforce/apex/CricApiController.getCurrentMatches';
export default class Cricketapp extends LightningElement {

    @track matches = [];
    @track filteredMatches = [];
    @track seriesOptions = [];
    selectedSeries = '';
    showSpinner = true;
    isCricScore = true;
    isCurrentMatches = false;

    connectedCallback() {
        this.fetchMatches();
    }

    fetchMatches() {
        this.showSpinner = true;
        this.isCricScore = true;
        this.isCurrentMatches = false;

        getCricScore()
            .then(response => {
                const data = JSON.parse(response).data;
                console.log('CricScore API Response:', data);
                this.matches = data.map(match => ({
                    id: match.id,
                    series: match.series,
                    team1: match.t1,
                    team2: match.t2,
                    matchStatus: match.ms,
                    status: match.status,
                    matchType: match.matchType,
                    dateTimeGMT: match.dateTimeGMT,
                    team1Score: match.t1s,
                    team2Score: match.t2s
                }));
                this.seriesOptions = [...new Set(this.matches.map(match => match.series))]
                    .map(series => ({ label: series, value: series }));
                this.filteredMatches = [...this.matches];
                this.showSpinner = false;
            })
            .catch(error => {
                console.error('Error fetching CricScore API:', error);
                this.showSpinner = false;
            });
    }

    fetchCurrentMatches() {
        this.showSpinner = true;
        this.isCricScore = false;
        this.isCurrentMatches = true;

        getCurrentMatches()
            .then(response => {
                const data = JSON.parse(response).data;
                console.log('Current Matches API Response:', data);
                this.filteredMatches = data.map(match => ({
                    id: match.id,
                    name: match.name,
                    matchType: match.matchType,
                    status: match.status,
                    venue: match.venue,
                    dateTimeGMT: match.dateTimeGMT,
                    teams: match.teams
                }));
                this.showSpinner = false;
            })
            .catch(error => {
                console.error('Error fetching Current Matches API:', error);
                this.showSpinner = false;
            });
    }
}