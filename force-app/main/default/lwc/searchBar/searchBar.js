import { LightningElement, track, wire, api } from 'lwc';
import fetchLookupData from '@salesforce/apex/CustomLookupLwcController.fetchLookupData';

const DELAY = 300;
export default class SearchBar extends LightningElement {
    @api placeholder = 'Search...';
    @api sObjectApiNames = ['Account', 'Contact', 'Employee'];
    @api fields = ['Name', 'Email'];
    
    @track lstResult = [];
    @track hasRecords = true;
    @track searchKey = '';
    @track isSearchLoading = false;
    @track selectedKeywords = [];
    delayTimeout;

    handleKeyChange(event) {
        this.isSearchLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
        }, DELAY);
    }

    @wire(fetchLookupData, { searchKey: '$searchKey', sObjectApiNames: '$sObjectApiNames', fields: '$fields' })
    searchResult({ data, error }) {
        this.isSearchLoading = false;
        if (data) {
            this.hasRecords = data.length === 0 ? false : true;
            this.lstResult = JSON.parse(JSON.stringify(data));
        } else if (error) {
            console.error('Error:', JSON.stringify(error));
        }
    }

    handleSuggestionClick(event) {
        const keyword = event.target.getAttribute('data-keyword');
        if (!this.selectedKeywords.includes(keyword)) {
            this.selectedKeywords.push(keyword);
            this.dispatchSearchEvent(keyword);
        }
        this.searchKey = '';
    }

    handleRemoveKeyword(event) {
        const keyword = event.target.getAttribute('data-keyword');
        this.selectedKeywords = this.selectedKeywords.filter(kw => kw !== keyword);
        this.dispatchSearchEvent(null); // Trigger search with updated keywords
    }

    dispatchSearchEvent(keyword) {
        const searchEvent = new CustomEvent('search', {
            detail: { keyword }
        });
        this.dispatchEvent(searchEvent);
    }

    get hasSelectedKeywords() {
        return this.selectedKeywords.length > 0;
    }
}