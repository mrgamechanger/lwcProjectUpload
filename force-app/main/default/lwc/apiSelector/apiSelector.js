import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';

export default class ApiSelector extends OmniscriptBaseMixin(LightningElement) {
    @track selectedApi = '';
    @track selectedApiLabel = '';
    @track apiDescription = '';
    @track isButtonDisabled = true;

    connectedCallback() {
        this.actionUtilClass = new OmniscriptActionCommonUtil();
       
    }

    get apiOptions() {
        return [
            { label: 'Food Meal Search', value: 'food-meal', description: 'Search and discover delicious food recipes and meal plans' },
            { label: 'Exercise Search', value: 'exercise', description: 'Find workout routines, exercises, and fitness activities' },
            { label: 'Forex Search', value: 'forex', description: 'Track and manage your expenses and financial data' },
            { label: 'Weather Search', value: 'weather', description: 'Get current weather conditions and forecasts for any location' },
            { label: 'Flight Search Search', value: 'flight-search', description: 'Search for flights, compare prices, and book tickets' },
            { label: 'Train Search Search', value: 'train-search', description: 'Find train schedules, routes, and book train tickets' }
        ];
    }

    handleApiSelection(event) {
        this.selectedApi = event.detail.value;
        this.isButtonDisabled = false;
        
        // Find the selected option to get label and description
        const selectedOption = this.apiOptions.find(option => option.value === this.selectedApi);
        if (selectedOption) {
            this.selectedApiLabel = selectedOption.label;
            this.apiDescription = selectedOption.description;
        }

        // Set OmniScript data immediately when selection changes
        const dataToSend = {
            selectedApiType: this.selectedApi,
            selectedApiLabel: this.selectedApiLabel,
            selectedApiDescription: this.apiDescription
        };
        this.omniApplyCallResp(dataToSend);
    }

  
       
    

    handleProceed() {
        if (this.selectedApi) {
            // Show success toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'API Selected',
                    message: `You have selected: ${this.selectedApiLabel}`,
                    variant: 'success'
                })
            );

            // Dispatch custom event to parent component
            const selectedEvent = new CustomEvent('apiselected', {
                detail: {
                    apiType: this.selectedApi,
                    apiLabel: this.selectedApiLabel,
                    apiDescription: this.apiDescription
                }
            });
            this.dispatchEvent(selectedEvent);

            // Trigger OmniScript next step
            this.omniNextStep();
        } else {
            // Show error toast if no API is selected
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Selection Required',
                    message: 'Please select an API before proceeding',
                    variant: 'error'
                })
            );
        }
    }

    // OmniScript validation method
    validate() {
        if (!this.selectedApi) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Validation Error',
                    message: 'Please select an API to continue',
                    variant: 'error'
                })
            );
            return false;
        }
        return true;
    }

    // Navigation methods for OmniScript
    handleNext() {
        if (this.validate()) {
            this.omniNextStep();
        }
    }

    handlePrevious() {
        this.omniPrevStep();
    }

    handleCancel() {
        this.omniCancel();
    }
}