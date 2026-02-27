import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/VoiceSearchController.searchRecords';

const DEFAULT_PLACEHOLDER = 'Type or use mic to search...';
const MIN_CHARS_DEFAULT = 2;
const MAX_RESULTS_DEFAULT = 7;

export default class VoiceSearchLookup extends LightningElement {
    @api label = 'Voice Search';
    @api placeholder = DEFAULT_PLACEHOLDER;
    @api 
    get minChars() {
        return this._minChars;
    }
    set minChars(value) {
        this._minChars = value;
    }
    _minChars;

    @api 
    get maxResults() {
        return this._maxResults;
    }
    set maxResults(value) {
        this._maxResults = value;
    }
    _maxResults;

    // Account or Contact
    @api objectApiName = 'Account';

    @track results = [];
    @track selectedRecord;
    @track searchKey = '';

    isOpen = false;
    isListening = false;
    recognition;
    blurTimeout;

    get objectOptions() {
        return [
            { label: 'Account', value: 'Account' },
            { label: 'Contact', value: 'Contact' }
        ];
    }

    get minCharsValue() {
        return this._minChars !== undefined && this._minChars !== null ? Number(this._minChars) : MIN_CHARS_DEFAULT;
    }

    get maxResultsValue() {
        return this._maxResults !== undefined && this._maxResults !== null ? Number(this._maxResults) : MAX_RESULTS_DEFAULT;
    }

    get hasResults() {
        return this.results?.length > 0;
    }

    get emptyMessage() {
        if ((this.searchKey || '').length < this.minCharsValue) {
            return `Type at least ${this.minCharsValue} characters`;
        }
        return 'No results found';
    }

    get listIcon() {
        return this.objectApiName === 'Contact' ? 'standard:contact' : 'standard:account';
    }

    get micIcon() {
        return this.isListening ? 'utility:stop' : 'utility:mic';
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.isOpen ? 'slds-is-open' : ''}`;
    }

    connectedCallback() {
        this.initSpeechRecognition();
    }

    disconnectedCallback() {
        if (this.recognition) {
            try {
                this.recognition.onresult = null;
                this.recognition.onend = null;
                this.recognition.onerror = null;
                if (this.isListening) {
                    this.recognition.stop();
                }
            } catch (e) {
                // no-op
            }
        }
    }

    initSpeechRecognition() {
        try {
            const w = window;
            const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                this.isListening = false;
                this.recognition = null;
                return;
            }
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => {
                const transcript = event?.results?.[0]?.[0]?.transcript || '';
                this.searchKey = transcript;
                this.fetchResults();
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };

            this.recognition.onerror = () => {
                this.isListening = false;
            };
        } catch (e) {
            // gracefully degrade
            this.recognition = null;
            this.isListening = false;
        }
    }

    // UI handlers
    handleInput(event) {
        this.searchKey = event.target.value;
        this.fetchResults();
    }

    handleChange(event) {
        this.searchKey = event.target.value;
        this.fetchResults();
    }

    handleObjectChange(event) {
        this.objectApiName = event.detail.value;
        // reset results for new object
        this.results = [];
        if (this.searchKey && this.searchKey.length >= this.minCharsValue) {
            this.fetchResults();
        }
    }

    handleSelect(event) {
        const id = event.currentTarget.dataset.id;
        const name = event.currentTarget.dataset.name;
        this.selectedRecord = { id, title: name, objectApiName: this.objectApiName };
        this.isOpen = false;
        this.dispatchEvent(
            new CustomEvent('recordselect', {
                detail: this.selectedRecord,
                bubbles: true,
                composed: true
            })
        );
    }

    clearSelection() {
        this.selectedRecord = null;
        this.searchKey = '';
        this.results = [];
        this.dispatchEvent(
            new CustomEvent('recordclear', {
                detail: { objectApiName: this.objectApiName },
                bubbles: true,
                composed: true
            })
        );
    }

    openDropdown() {
        this.isOpen = true;
    }

    handleBlur() {
        // Delay closing to allow click on an option
        window.clearTimeout(this.blurTimeout);
        this.blurTimeout = setTimeout(() => {
            this.isOpen = false;
        }, 150);
    }

    toggleVoice() {
        if (!this.recognition) {
            // Not supported
            return;
        }
        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        } else {
            this.isListening = true;
            try {
                this.recognition.start();
            } catch (e) {
                // ignore multiple start calls
            }
        }
    }

    // Server call
    fetchResults() {
        const term = (this.searchKey || '').trim();
        if (term.length < this.minCharsValue) {
            this.results = [];
            this.isOpen = !!term.length;
            return;
        }

        searchRecords({
            objectApiName: this.objectApiName,
            searchKey: term,
            limitSize: this.maxResultsValue
        })
            .then((data) => {
                this.results = (data || []).map((row) => {
                    return {
                        id: row.Id,
                        title: row.Name,
                        subtitle:
                            this.objectApiName === 'Contact'
                                ? (row.Title ? row.Title + ' • ' : '') + (row.Email || '')
                                : row.Industry || row.Type || ''
                    };
                });
                this.isOpen = true;
            })
            .catch(() => {
                this.results = [];
                this.isOpen = true;
            });
    }
}
