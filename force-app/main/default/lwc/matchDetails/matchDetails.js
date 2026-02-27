import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';

export default class MatchDetails extends OmniscriptBaseMixin(LightningElement) {
    @api matchId;
    @track matchData = null;
    @track loading = true;
    @track error = null;
    apiKey = '1adb8f1d-0cd6-48f0-9c98-96bb999269ff';

    connectedCallback() {
        if (this.matchId) {
            this.fetchMatchDetails();
        }
    }

    fetchMatchDetails() {
        this.loading = true;
        this.error = null;

        const params = {
            input: JSON.stringify({
                matchId: this.matchId,
                apiKey: this.apiKey
            }),
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'api_match_details',
            options: '{}'
        };

        this.actionUtilClass = new OmniscriptActionCommonUtil();
        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then((response) => {
                console.log('Match Details Response:', JSON.stringify(response));
                const res = response.result.IPResult;
                
                if (res.status === "success" && res.data) {
                    this.matchData = res.data;
                } else {
                    this.error = "Failed to fetch match details";
                }
            })
            .catch((error) => {
                console.error('Error fetching match details:', error);
                this.error = "Error fetching match details. Please try again later.";
            })
            .finally(() => {
                this.loading = false;
            });
    }

    get formattedDate() {
        if (!this.matchData || !this.matchData.dateTimeGMT) return '';
        
        const date = new Date(this.matchData.dateTimeGMT);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    get matchStatusClass() {
        if (!this.matchData || !this.matchData.status) return '';
        
        if (this.matchData.status.includes('won')) {
            return 'slds-text-color_success';
        } else if (this.matchData.status.includes('Match ended')) {
            return 'slds-text-color_default';
        } else {
            return 'slds-text-color_warning';
        }
    }

    get team1Score() {
        if (!this.matchData || !this.matchData.score || this.matchData.score.length === 0) return '';
        
        const team1Score = this.matchData.score.find(s => s.inning.includes(this.matchData.teams[0]));
        return team1Score ? `${team1Score.r}/${team1Score.w} (${team1Score.o} ov)` : '';
    }

    get team2Score() {
        if (!this.matchData || !this.matchData.score || this.matchData.score.length === 0) return '';
        
        const team2Score = this.matchData.score.find(s => s.inning.includes(this.matchData.teams[1]));
        return team2Score ? `${team2Score.r}/${team2Score.w} (${team2Score.o} ov)` : '';
    }

    get matchWinnerClass() {
        if (!this.matchData || !this.matchData.matchWinner) return '';
        
        return 'slds-text-color_success slds-text-heading_medium';
    }

    get tossInfoClass() {
        return 'slds-text-color_default slds-text-body_regular';
    }

    handleClose() {
        // Dispatch an event to close the modal or navigate back
        const closeEvent = new CustomEvent('close', {
            detail: { matchId: this.matchId }
        });
        this.dispatchEvent(closeEvent);
    }
} 