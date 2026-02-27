import { LightningElement } from 'lwc';
import getContactname from '@salesforce/apex/ContactFetch.getContactname';

export default class DebounceContact extends LightningElement {
    searchTerm = '';
    result = [];
    error = null;
    debounceTimeout;

    get noResults() {
        return this.result && this.result.length === 0;
    }

    searchNameHandler(event) {
        this.searchTerm = event.target.value;
        this.debounceSearch();
    }

    debounceSearch() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            if (this.searchTerm.trim() === '') {
                this.result = [];
                return;
            }

            getContactname({ Name: this.searchTerm })
                .then(res => {
                    this.result = res;
                    this.error = null;
                })
                .catch(error => {
                    console.error(error);
                    this.error = 'Error fetching contacts';
                    this.result = [];
                });
        }, 2500); // Adjust debounce delay as needed
    }

    handleReset() {
        this.searchTerm = '';
        this.result = [];
    }
}