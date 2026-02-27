import { LightningElement, track } from 'lwc';
import searchAccountsAndContacts from '@salesforce/apex/VoiceSearchController.searchAccountsAndContacts';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class VoiceSearch extends NavigationMixin(LightningElement) {
    @track searchResults = [];
    @track searchTerm = '';
    @track isListening = false;
    @track isSearching = false;
    @track hasResults = false;
    @track recognition = null;
    @track errorMessage = '';

    connectedCallback() {
        this.initializeSpeechRecognition();
    }

    initializeSpeechRecognition() {
        // Check if browser supports Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.errorMessage = '';
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.searchTerm = transcript;
                this.performSearch(transcript);
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                if (event.error === 'no-speech') {
                    this.errorMessage = 'No speech detected. Please try again.';
                } else if (event.error === 'not-allowed') {
                    this.errorMessage = 'Microphone permission denied. Please enable microphone access.';
                } else {
                    this.errorMessage = 'Error occurred: ' + event.error;
                }
                this.showToast('Error', this.errorMessage, 'error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        } else {
            this.errorMessage = 'Your browser does not support voice recognition. Please use Chrome or Edge.';
        }
    }

    handleStartListening() {
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (error) {
                if (error.message.includes('already started')) {
                    this.recognition.stop();
                    setTimeout(() => {
                        this.recognition.start();
                    }, 100);
                } else {
                    this.errorMessage = 'Could not start voice recognition: ' + error.message;
                    this.showToast('Error', this.errorMessage, 'error');
                }
            }
        } else {
            this.showToast('Error', 'Voice recognition not supported in this browser', 'error');
        }
    }

    handleStopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    handleSearchInputChange(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm && this.searchTerm.length > 0) {
            this.performSearch(this.searchTerm);
        } else {
            this.searchResults = [];
            this.hasResults = false;
        }
    }

    handleSearchButtonClick() {
        if (this.searchTerm && this.searchTerm.trim().length > 0) {
            this.performSearch(this.searchTerm);
        }
    }

    performSearch(searchText) {
        if (!searchText || searchText.trim().length === 0) {
            this.searchResults = [];
            this.hasResults = false;
            return;
        }

        this.isSearching = true;
        this.errorMessage = '';

        searchAccountsAndContacts({ searchTerm: searchText.trim() })
            .then((results) => {
                this.searchResults = results;
                this.hasResults = results && results.length > 0;
                this.isSearching = false;
            })
            .catch((error) => {
                console.error('Search error:', error);
                this.errorMessage = 'Error searching records: ' + (error.body ? error.body.message : error.message);
                this.showToast('Error', this.errorMessage, 'error');
                this.searchResults = [];
                this.hasResults = false;
                this.isSearching = false;
            });
    }

    handleClearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.hasResults = false;
        this.errorMessage = '';
        if (this.isListening) {
            this.handleStopListening();
        }
    }

    handleRecordClick(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordType = event.currentTarget.dataset.type;
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    get hasSearchTerm() {
        return this.searchTerm && this.searchTerm.length > 0;
    }

    get isVoiceSupported() {
        return this.recognition !== null;
    }
}

