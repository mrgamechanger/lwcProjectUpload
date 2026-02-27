import { LightningElement, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';

export default class ApiSelectorDemo extends OmniscriptBaseMixin(LightningElement) {
    @track selectedApiType = '';
    @track selectedApiLabel = '';
    @track selectedApiDescription = '';
    @track showResult = false;

    connectedCallback() {
        super.connectedCallback();
        // Initialize with OmniScript data if available
        if (this.omniJsonData && this.omniJsonData.selectedApiType) {
            this.selectedApiType = this.omniJsonData.selectedApiType;
            this.selectedApiLabel = this.omniJsonData.selectedApiLabel || '';
            this.selectedApiDescription = this.omniJsonData.selectedApiDescription || '';
            this.showResult = true;
        }
    }

    handleApiSelected(event) {
        const { apiType, apiLabel, apiDescription } = event.detail;
        
        this.selectedApiType = apiType;
        this.selectedApiLabel = apiLabel;
        this.selectedApiDescription = apiDescription;
        this.showResult = true;

        // Set OmniScript data using omniApplyCallResp
        this.omniApplyCallResp('selectedApiType', apiType);
        this.omniApplyCallResp('selectedApiLabel', apiLabel);
        this.omniApplyCallResp('selectedApiDescription', apiDescription);
    }

    handleReset() {
        this.selectedApiType = '';
        this.selectedApiLabel = '';
        this.selectedApiDescription = '';
        this.showResult = false;
        
        // Reset the child component
        const apiSelector = this.template.querySelector('api-selector');
        if (apiSelector) {
            // You can add a reset method to the child component if needed
            console.log('Reset triggered');
        }
    }
} 