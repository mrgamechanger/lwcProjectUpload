import { LightningElement, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';

export default class CreateCricketApp extends OmniscriptBaseMixin(LightningElement) {
    @track matches = [];
    @track filteredMatches = [];
    @track seriesOptions = [];
    selectedSeries = '';
    showSpinner = true;
    isCricScore = true;
    isCurrentMatches = false;
    isPointsTable = false;
    pointsTableData = [];
    apiKey = '1adb8f1d-0cd6-48f0-9c98-96bb999269ff';
    @track selectedMatchId;
    @track showMatchDetails = false;
    @track matchDetails = null;
  
    // Tab classes
    get homeTabClass() {
        return `slds-tabs_default__item ${this.isCricScore ? 'slds-is-active' : ''}`;
    }

    get currentMatchesTabClass() {
        return `slds-tabs_default__item ${this.isCurrentMatches ? 'slds-is-active' : ''}`;
    }

    get pointsTableTabClass() {
        return `slds-tabs_default__item ${this.isPointsTable ? 'slds-is-active' : ''}`;
    }

    connectedCallback() {
        this.isCricScore = true;
        this.actionUtilClass = new OmniscriptActionCommonUtil();
        this.fetchMatches();
    }

    fetchMatches() {
        this.showSpinner = true;
        this.isCricScore = true;
        this.isCurrentMatches = false;
        this.isPointsTable = false;
        this.matches = [];
        this.filteredMatches = [];

        const params = {
            input: JSON.stringify({}),
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'api_cricket',
            options: '{}',
        };

        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then((response) => {
                console.log('Raw Response:', JSON.stringify(response));
                const res = response.result.IPResult;
                console.log('Response:', JSON.stringify(res.data));
                this.matches = res.data.map(match => {
                    // Add match status properties
                    const today = new Date().toISOString().split('T')[0];
                    const matchDate = match.dateTimeGMT.split('T')[0];
                    
                    return {
                        id: match.id,
                        series: match.series,
                        team1: match.t1,
                        team2: match.t2,
                        team1Image: match.t1img,
                        team2Image: match.t2img,
                        matchStatus: match.ms,
                        status: match.status,
                        matchType: match.matchType,
                        dateTimeGMT: this.extractTime(match.dateTimeGMT),
                        team1Score: match.t1s,
                        team2Score: match.t2s,
                        isToday: matchDate === today,
                        isUpcoming: matchDate > today,
                        isCompleted: matchDate < today
                    };
                });
                
                // Sort matches by date (most recent first)
                this.matches.sort((a, b) => {
                    const dateA = new Date(a.dateTimeGMT);
                    const dateB = new Date(b.dateTimeGMT);
                    return dateB - dateA; // Descending order (newest first)
                });
                
                this.seriesOptions = this.matches.map(match => ({ label: match.series, value: match.series }))
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => t.value === value.value)
                    );
                
                // Apply the previously selected series filter if it exists
                if (this.selectedSeries) {
                    this.filteredMatches = this.matches.filter(match => match.series === this.selectedSeries);
                } else {
                    this.filteredMatches = [...this.matches];
                }
                
                this.showSpinner = false;
            })
            .catch((error) => {
                this.showSpinner = false;
                console.error('Error fetching cricket score details:', error);
            });
    }

    fetchCurrentMatches() {
        this.showSpinner = true;
        this.isCricScore = false;
        this.isCurrentMatches = true;
        this.isPointsTable = false;
        const params = {
            input: JSON.stringify({}),
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'api_currentMatches',
            options: '{}',
        };

        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then((response) => {
                console.log('Current Matches Response:', JSON.stringify(response));
                const res = response.result.IPResult;
                this.filteredMatches = res.data.map(match => {
                    // Add match status properties
                    const today = new Date().toISOString().split('T')[0];
                    const matchDate = match.dateTimeGMT.split('T')[0];
                    
                    return {
                        id: match.id,
                        name: match.name,
                        matchType: match.matchType,
                        status: match.status,
                        venue: match.venue,
                        dateTimeGMT: this.extractTime(match.dateTimeGMT),
                        teams: match.teams,
                        score: match.score.map(s => ({
                            runs: s.r,
                            wickets: s.w,
                            overs: s.o,
                            inning: s.inning
                        })),
                        matchStarted: match.matchStarted,
                        matchEnded: match.matchEnded,
                        isToday: matchDate === today,
                        isUpcoming: matchDate > today,
                        isCompleted: matchDate < today
                    };
                });
                
                // Sort matches by date (most recent first)
                this.filteredMatches.sort((a, b) => {
                    const dateA = new Date(a.matchStarted);
                    const dateB = new Date(b.matchStarted);
                    return dateB - dateA; // Descending order (newest first)
                });
                
                this.showSpinner = false;
            })
            .catch((error) => {
                this.showSpinner = false;
                console.error('Error fetching current matches:', error);
            });
    }

    fetchPointsTable() {
        this.showSpinner = true;
        this.isCricScore = false;
        this.isCurrentMatches = false;
        this.isPointsTable = true;

        const params = {
            input: JSON.stringify({
               
            }),
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'api_pointstable',
            options: '{}'
        };

        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then((response) => {
                console.log('Points Table Response:', JSON.stringify(response));
                const res = response.result.IPResult;
                
                if (res.status === "success") {
                    this.pointsTableData = res.data.map(team => ({
                        teamname: team.teamname,
                        shortname: team.shortname,
                        img: team.img,
                        matches: team.matches,
                        wins: team.wins,
                        loss: team.loss,
                        ties: team.ties,
                        nr: team.nr,
                        points: team.wins * 2,
                        rowClass: 'slds-hint-parent', // Default class
                        positionClass: '' // Default empty
                    }));
                    
                    // Sort teams by points
                    this.pointsTableData.sort((a, b) => b.points - a.points);

                    // Add position number and update classes for top 4
                    this.pointsTableData = this.pointsTableData.map((team, index) => ({
                        ...team,
                        position: index + 1,
                        rowClass: index < 4 ? 'slds-hint-parent top-four' : 'slds-hint-parent',
                        positionClass: index < 4 ? 'position-badge' : ''
                    }));
                } else {
                    console.error('Failed to fetch points table:', res.info);
                }
            })
            .catch((error) => {
                console.error('Error fetching points table:', error);
            })
            .finally(() => {
                this.showSpinner = false;
            });
    }

    handleSeriesChange(event) {
        this.selectedSeries = event.target.value;
        this.filteredMatches = this.selectedSeries
            ? this.matches.filter(match => match.series === this.selectedSeries)
            : [...this.matches];
        
        // Sort filtered matches by date (most recent first)
        this.filteredMatches.sort((a, b) => {
            const dateA = new Date(a.dateTimeGMT);
            const dateB = new Date(b.dateTimeGMT);
            return dateB - dateA; // Descending order (newest first)
        });
    }

    handleTodayMatch() {
        const today = new Date().toISOString().slice(0, 10);
        this.filteredMatches = this.matches.filter(match =>
            new Date(match.dateTimeGMT).toISOString().slice(0, 10) === today
        );

        // Sort today's matches by date (most recent first)
        this.filteredMatches.sort((a, b) => {
            const dateA = new Date(a.dateTimeGMT);
            const dateB = new Date(b.dateTimeGMT);
            return dateB - dateA; // Descending order (newest first)
        });

        if (this.filteredMatches.length === 0) {
            this.filteredMatches = null;
        }
    }

    extractTime(dateTimeString) {
        return dateTimeString.split('T')[0];
    }

    handleHome() {
        this.isCricScore = true;
        this.isCurrentMatches = false;
        this.isPointsTable = false;
        this.fetchMatches();
        // The selected series will be maintained in fetchMatches
    }

    // Method to handle match click and display match details in a modal
    handleMatchClick(event) {
        const matchId = event.currentTarget.dataset.matchId;
        if (matchId) {
            this.selectedMatchId = matchId;
            this.showSpinner = true;

            const params = {
                input: JSON.stringify({
                    "matchID": matchId
                }),
                sClassName: 'omnistudio.IntegrationProcedureService',
                sMethodName: 'api_matchdetails',
                options: '{}'
            };
    
            this.actionUtilClass.executeAction(params, null, this, null, null)
                .then((response) => {
                    console.log('Points Table Response:', JSON.stringify(response));
                    const res = response.result.IPResult;
                    if (res.status === "success") {
                        this.matchDetails = res.data;
                        this.showMatchDetails = true;
                    } else {
                        console.error('Failed to fetch match details:', res.info);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching points table:', error);
                })
                .finally(() => {
                    this.showSpinner = false;
                });
            
            // Fetch match details from the API
          
            
           
        }
    }

    handleCloseMatchDetails() {
        this.showMatchDetails = false;
        this.selectedMatchId = null;
        this.matchDetails = null;
    }

    get getTeamRowClass() {
        return function(team) {
            return team.position <= 4 ? 'slds-hint-parent top-four' : 'slds-hint-parent';
        }
    }

    get getPositionClass() {
        return (event) => {
            const position = parseInt(event.target.dataset.position, 10);
            return position <= 4 ? 
                'slds-icon_container slds-icon-utility-announcement slds-m-right_x-small position-indicator' : 
                '';
        }
    }

    get getPositionBadgeClass() {
        return (team) => {
            return team.position <= 4 ? 'position-badge' : '';
        }
    }

    // Getters for match details
    get team1Name() {
        return this.matchDetails && this.matchDetails.teams && this.matchDetails.teams.length > 0 
            ? this.matchDetails.teams[0] 
            : '';
    }

    get team2Name() {
        return this.matchDetails && this.matchDetails.teams && this.matchDetails.teams.length > 1 
            ? this.matchDetails.teams[1] 
            : '';
    }

    get team1Score() {
        return this.matchDetails && this.matchDetails.score && this.matchDetails.score.length > 0 
            ? `${this.matchDetails.score[0].r}/${this.matchDetails.score[0].w} (${this.matchDetails.score[0].o} ov)` 
            : '';
    }

    get team2Score() {
        return this.matchDetails && this.matchDetails.score && this.matchDetails.score.length > 1 
            ? `${this.matchDetails.score[1].r}/${this.matchDetails.score[1].w} (${this.matchDetails.score[1].o} ov)` 
            : '';
    }

    // Replace the getMatchStatus method with a getter property
    get matchStatuses() {
        if (!this.filteredMatches) return [];
        
        return this.filteredMatches.map(match => {
            if (!match || !match.dateTimeGMT) return { id: match?.id, status: '', statusClass: '' };
            
            const today = new Date().toISOString().split('T')[0];
            const matchDate = match.dateTimeGMT.split('T')[0];
            
            let status = '';
            let statusClass = '';
            
            if (matchDate === today) {
                status = 'Today';
                statusClass = 'match-status match-status-today';
            } else if (matchDate > today) {
                status = 'Upcoming';
                statusClass = 'match-status match-status-upcoming';
            } else {
                status = 'Completed';
                statusClass = 'match-status match-status-completed';
            }
            
            return { 
                id: match.id, 
                status, 
                statusClass 
            };
        });
    }

    // Getter for match status label in modal
    get matchStatusLabel() {
        if (!this.matchDetails) return '';
        
        const today = new Date().toISOString().split('T')[0];
        const matchDate = this.matchDetails.date;
        
        if (matchDate === today) {
            return 'Today';
        } else if (matchDate > today) {
            return 'Upcoming';
        } else {
            return 'Completed';
        }
    }

    // Getter for match status class in modal
    get matchStatusClass() {
        if (!this.matchDetails) return '';
        
        const today = new Date().toISOString().split('T')[0];
        const matchDate = this.matchDetails.date;
        
        if (matchDate === today) {
            return 'match-status match-status-today';
        } else if (matchDate > today) {
            return 'match-status match-status-upcoming';
        } else {
            return 'match-status match-status-completed';
        }
    }

    // Helper method to get match status by ID
    getMatchStatusById(matchId) {
        const matchStatus = this.matchStatuses.find(status => status.id === matchId);
        return matchStatus ? matchStatus.status : '';
    }

    // Helper method to get match status class by ID
    getMatchStatusClassById(matchId) {
        const matchStatus = this.matchStatuses.find(status => status.id === matchId);
        return matchStatus ? matchStatus.statusClass : '';
    }

    // Method to check if a match is today's match
    isTodayMatch(match) {
        if (!match || !match.dateTimeGMT) return false;
        
        const today = new Date().toISOString().split('T')[0];
        const matchDate = match.dateTimeGMT.split('T')[0];
        
        return matchDate === today;
    }
}