import { LightningElement, track } from 'lwc';
import searchContacts from '@salesforce/apex/SearchController.searchContacts';
import searchAccounts from '@salesforce/apex/SearchController.searchAccounts';

export default class SearchBarWithTags extends LightningElement {
    @track tags = [];
    @track suggestions = [];
    @track showSuggestions = false;
    query = '';

    handleInput(event) {
        this.query = event.target.value;
        if (this.query.length > 1) {
            this.getSuggestions();
        } else {
            this.suggestions = [];
            this.showSuggestions = false;
        }
    }

    handleKeyUp(event) {
        if (event.key === 'Enter' && this.query) {
            this.addTag(this.query);
            this.query = '';
            event.target.value = '';
            this.showSuggestions = false;
        }
    }

    handleRemoveTag(event) {
        const tag = event.currentTarget.dataset.tag;
        this.tags = this.tags.filter(t => t !== tag);
    }

    async getSuggestions() {
        const contactSuggestions = await searchContacts({ query: this.query });
        const accountSuggestions = await searchAccounts({ query: this.query });
        this.suggestions = [...new Set([...contactSuggestions, ...accountSuggestions])];
        this.showSuggestions = this.suggestions.length > 0;
    }

    handleSuggestionClick(event) {
        const suggestion = event.target.innerText;
        this.addTag(suggestion);
        this.query = '';
        this.showSuggestions = false;
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags = [...this.tags, tag];
        }
    }
}