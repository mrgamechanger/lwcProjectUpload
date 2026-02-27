import { LightningElement, track } from 'lwc';
import runVoiceSearch from '@salesforce/apex/VoiceChatBotController.runVoiceSearch';
import fetchRecordUrl from '@salesforce/apex/VoiceChatBotController.fetchRecordUrl';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
const DEFAULT_PAGE_SIZE = 10;

export default class VoiceChatBot extends OmniscriptBaseMixin(LightningElement) {
    @track query = '';
    @track listening = false;
    @track error;

    // Paged results per object
    @track accountResults = [];
    @track contactResults = [];
    @track caseResults = [];
    @track opptyResults = [];

    // internal cursors
    accountOffset = 0;
    contactOffset = 0;
    caseOffset = 0;
    opptyOffset = 0;

    accountHasMore = false;
    contactHasMore = false;
    caseHasMore = false;
    opptyHasMore = false;

    pageSize = DEFAULT_PAGE_SIZE;

    recognition;
    // Use valid SLDS icons. utility:microphone is available; toggle to utility:mute or utility:close if error.
    micIcon = 'utility:microphone';

    get hasResults() {
        return (
            (this.accountResults?.length || 0) +
                (this.contactResults?.length || 0) +
                (this.caseResults?.length || 0) +
                (this.opptyResults?.length || 0) >
            0
        );
    }

    get disableAccountPrev() {
        return this.accountOffset === 0;
    }
    get disableAccountNext() {
        return !this.accountHasMore;
    }
    get disableContactPrev() {
        return this.contactOffset === 0;
    }
    get disableContactNext() {
        return !this.contactHasMore;
    }
    get disableCasePrev() {
        return this.caseOffset === 0;
    }
    get disableCaseNext() {
        return !this.caseHasMore;
    }
    get disableOpptyPrev() {
        return this.opptyOffset === 0;
    }
    get disableOpptyNext() {
        return !this.opptyHasMore;
    }

    connectedCallback() {
        this.initSpeech();
    }

    initSpeech() {
        try {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.lang = 'en-US';
                this.recognition.interimResults = false;
                this.recognition.maxAlternatives = 1;

                this.recognition.addEventListener('result', (event) => {
                    const transcript = Array.from(event.results)
                        .map((r) => r[0])
                        .map((r) => r.transcript)
                        .join(' ')
                        .trim();
                    if (transcript) {
                        this.query = transcript;
                        this.runCommand();
                    }
                });

                this.recognition.addEventListener('start', () => {
                    this.listening = true;
                    this.micIcon = 'utility:microphone';
                });

                this.recognition.addEventListener('end', () => {
                    this.listening = false;
                    this.micIcon = 'utility:microphone';
                });

                this.recognition.addEventListener('error', (e) => {
                    this.error = `Voice error: ${e?.error || 'unknown'}`;
                    this.listening = false;
                    this.micIcon = 'utility:warning';
                });
            } else {
                // Fallback: no speech recognition available
                this.recognition = null;
            }
        } catch (e) {
            this.error = this.normalizeError(e);
        }
    }

    toggleVoice = () => {
        if (!this.recognition) {
            this.error =
                'Voice recognition not supported by this browser. Please use Chrome or Edge or type your query.';
            return;
        }
        try {
            if (this.listening) {
                this.recognition.stop();
                this.listening = false;
                this.micIcon = 'utility:microphone';
            } else {
                this.error = undefined;
                this.recognition.start();
                this.listening = true;
                this.micIcon = 'utility:microphone';
            }
        } catch (e) {
            this.error = this.normalizeError(e);
        }
    };

    handleMicKeydown(event) {
        const key = event.key || event.keyCode;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 13 || key === 32) {
            event.preventDefault();
            this.toggleVoice();
        }
    }

    handleQueryChange(event) {
        this.query = event.target.value;
    }

    runCommand = async () => {
        this.error = undefined;

        // Parse intent from query
        const parsed = this.parseCommand(this.query || '');
        // Reset offsets on new search, except if it is an "open" command
        if (parsed.intent === 'search') {
            this.accountOffset = 0;
            this.contactOffset = 0;
            this.caseOffset = 0;
            this.opptyOffset = 0;
        }

        try {
            if (parsed.intent === 'open') {
                // Try get exact record URL and navigate
                const url = await fetchRecordUrl({
                    sobjectType: parsed.objectType,
                    nameOrNumber: parsed.term
                });
                if (url) {
                    // simple navigation - in LEX it will open in the same tab
                    window.open(url, '_blank');
                } else {
                    this.error =
                        'Could not find an exact match to open. Try running a search.';
                }
                return;
            }

            // Default: search
            const resp = await runVoiceSearch({
                query: parsed.term,
                pageSize: this.pageSize,
                accountOffset: this.accountOffset,
                contactOffset: this.contactOffset,
                caseOffset: this.caseOffset,
                opptyOffset: this.opptyOffset,
                restrictTo: parsed.objectType // may be null for all
            });

            // Assign results
            this.accountResults = resp?.accounts || [];
            this.contactResults = resp?.contacts || [];
            this.caseResults = resp?.cases || [];
            this.opptyResults = resp?.opportunities || [];

            this.accountHasMore = resp?.accountHasMore || false;
            this.contactHasMore = resp?.contactHasMore || false;
            this.caseHasMore = resp?.caseHasMore || false;
            this.opptyHasMore = resp?.opptyHasMore || false;

            // Hook for transcripts (disabled per scope)
            // this.logTranscript({ input: this.query, response: resp });

        } catch (e) {
            this.error = this.normalizeError(e);
        }
    };

    // Very lightweight grammar:
    // - "search [accounts|contacts|cases|opportunities] <term>"
    // - "find ..." same as search
    // - "open [account|contact|case|opportunity] <name/number>"
    parseCommand(raw) {
        const text = (raw || '').toLowerCase().trim();
        let intent = 'search';
        let objectType = null; // Account|Contact|Case|Opportunity
        let term = text;

        if (text.startsWith('open ')) {
            intent = 'open';
            term = text.replace(/^open\s+/, '').trim();
        } else if (text.startsWith('search ')) {
            intent = 'search';
            term = text.replace(/^search\s+/, '').trim();
        } else if (text.startsWith('find ')) {
            intent = 'search';
            term = text.replace(/^find\s+/, '').trim();
        }

        // detect object hint
        const mapping = {
            account: 'Account',
            accounts: 'Account',
            contact: 'Contact',
            contacts: 'Contact',
            case: 'Case',
            cases: 'Case',
            opportunity: 'Opportunity',
            opportunities: 'Opportunity',
            'opp': 'Opportunity',
            'opps': 'Opportunity'
        };

        const tokens = term.split(/\s+/);
        if (tokens.length > 1) {
            const maybeObj = tokens[0];
            const mapped = mapping[maybeObj];
            if (mapped) {
                objectType = mapped;
                tokens.shift();
                term = tokens.join(' ').trim();
            }
        }

        // fallback: if nothing left for term, keep original
        if (!term) {
            term = text;
        }

        return { intent, objectType, term };
    }

    // Pagination handlers
    async nextAccountPage() {
        this.accountOffset += this.pageSize;
        await this.runCommand();
    }
    async prevAccountPage() {
        this.accountOffset = Math.max(0, this.accountOffset - this.pageSize);
        await this.runCommand();
    }
    async nextContactPage() {
        this.contactOffset += this.pageSize;
        await this.runCommand();
    }
    async prevContactPage() {
        this.contactOffset = Math.max(0, this.contactOffset - this.pageSize);
        await this.runCommand();
    }
    async nextCasePage() {
        this.caseOffset += this.pageSize;
        await this.runCommand();
    }
    async prevCasePage() {
        this.caseOffset = Math.max(0, this.caseOffset - this.pageSize);
        await this.runCommand();
    }
    async nextOpptyPage() {
        this.opptyOffset += this.pageSize;
        await this.runCommand();
    }
    async prevOpptyPage() {
        this.opptyOffset = Math.max(0, this.opptyOffset - this.pageSize);
        await this.runCommand();
    }

    // Open button click
    async handleOpen(event) {
        const id = event.currentTarget?.dataset?.id;
        const obj = event.currentTarget?.dataset?.object;
        if (!id || !obj) {
            return;
        }
        try {
            const url = await fetchRecordUrl({ sobjectType: obj, recordId: id });
            if (url) {
                window.open(url, '_blank');
            }
        } catch (e) {
            this.error = this.normalizeError(e);
        }
    }

    normalizeError(e) {
        if (Array.isArray(e?.body)) {
            return e.body.map((er) => er.message).join(', ');
        }
        return e?.body?.message || e?.message || 'Unknown error';
    }


invokeIntegrationProcedure() {
        const input = {
            userQuery: this.query,
            accountResults: this.accountResult}
            
    const params = {
        input: JSON.stringify(input),
        sClassName: 'omnistudio.IntegrationProcedureService',
        sMethodName: 'log_Transcript',
        options: '{}'
    };
   this.omniRemoteCall(params, true)
            .then(response => {
                console.log('IP Response:', response);
                // Optional: Update OmniScript Data JSON with response
                // this.omniApplyCallResp(response); 
            })
            .catch(error => {
                console.error('IP Error:', error);
            });
        }
}
