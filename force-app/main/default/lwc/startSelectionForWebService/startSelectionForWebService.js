import { LightningElement } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';

export default class StartSelectionForWebService extends OmniscriptBaseMixin(LightningElement) {
    selectedOption = 'Flights';

    options = [
        { label: 'Flights', value: 'Flights', icon: 'utility:airplane', cls: 'option-card', ariaSelected: 'false', checked: false },
        { label: 'Hotels', value: 'Hotels', icon: 'utility:hotel', cls: 'option-card', ariaSelected: 'false', checked: false },
        { label: 'Trains', value: 'Trains', icon: 'utility:train', cls: 'option-card', ariaSelected: 'false', checked: false },
        { label: 'Forex', value: 'Forex', icon: 'utility:money', cls: 'option-card', ariaSelected: 'false', checked: false }
    ];

    connectedCallback() {
        // initialize selected class and ARIA/checked state
        this._applySelectionState(this.selectedOption);
    }

    handleSelect(event) {
        const val = event.currentTarget?.dataset?.value;
        if (!val) return;
        this._commitSelection(val);
    }

    handleChange(event) {
        const val = event.target?.value;
        if (!val) return;
        this._commitSelection(val);
    }

    handleKeyDown(event) {
        // Activate on Enter or Space for accessibility on label wrapper
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const val = event.currentTarget?.dataset?.value;
            if (val) this._commitSelection(val);
        }
    }

    _commitSelection(val) {
        this.selectedOption = val;

        const dataToSend = { selectedService: this.selectedOption };
        try {
            this.omniApplyCallResp(dataToSend);
        } catch (e) {
            // ignore if not in OmniScript runtime
        }

        this._applySelectionState(val);
        this.dispatchEvent(new CustomEvent('selectionchange', { detail: { value: val } }));
    }

    _applySelectionState(selected) {
        this.options = this.options.map((o) => {
            const isSel = o.value === selected;
            return {
                ...o,
                cls: isSel ? 'option-card selected' : 'option-card',
                ariaSelected: isSel ? 'true' : 'false',
                checked: isSel
            };
        });
    }
}
