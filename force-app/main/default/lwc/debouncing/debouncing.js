import { LightningElement, wire } from 'lwc';
import getAccountsByName from '@salesforce/apex/AccountSearch.getAccountsByName';

export default class Debouncing extends LightningElement {
    searchTerm = '';
    result = [];
    apiFilter = '';
    display = false;
    error = null;

    // Getter to check if there are no results
    get noResults() {
        return this.result && this.result.length === 0;
    }

    seachnamehandler(event) {
        this.searchTerm = event.target.value;
        this.debounceSearch();
    }

    @wire(getAccountsByName, { searchName: '$apiFilter' })
    contactHandler({ data, error }) {
        if (data) {
            this.result = data;
            this.error = null;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    debounceTimeout;

    debounceSearch() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        // Debounce API call by 1500ms
        this.debounceTimeout = setTimeout(() => {
            this.display = true;
            this.apiFilter = this.searchTerm;
        }, 1500);
    }

    // Reset method to clear the search term and results
    handleReset() {
        this.searchTerm = '';
        this.apiFilter = '';
        this.result = [];
        this.display = false;
    }
}