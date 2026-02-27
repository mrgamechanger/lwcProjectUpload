import { LightningElement, track } from 'lwc';
import getReactionsData from '@salesforce/apex/ChallengeOfTheDay.getReactionsData';

const columns = [
    { label: 'Name', fieldName: 'Linkedin_Profile_URL__c', type: 'url', typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } },
    { label: '# Reactions/Reposts', fieldName: 'Number_of_Reactions_Reposts__c', type: 'text' }
];

export default class ChallengeOfTheDayCompetitionReactions extends LightningElement {    
    @track reactions=[];
    columns = columns;
    rowLimit = 10;
    rowOffSet = 0;
    showWarning = false;
    @track enableInfiniteLoading = false;
    
    connectedCallback() {
        this.loadData();
    }

    async loadData(){
        return  await getReactionsData({ limitSize: this.rowLimit , offset : this.rowOffSet })
        .then(result => {
            let updatedReactions = [...this.reactions, ...result];
            this.reactions = updatedReactions;
            this.enableInfiniteLoading = (result.length == this.rowLimit  || result.length != 0);   //to stop spinner 
            if(this.reactions.length == 0) 
                this.showWarning = true;
        })
        .catch(error => {
            console.error(error);
            this.reactions = null;
        });
    }

    loadMoreData(event) {
        const { target } = event;
        target.isLoading = true;     //to show spinner 

        this.rowOffSet = this.rowOffSet + this.rowLimit;
        this.loadData()
            .then(()=> {
                target.isLoading = false;          //to stop spinner 
            });   
    }  
}