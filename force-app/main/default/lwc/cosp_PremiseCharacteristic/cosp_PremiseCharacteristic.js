import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';
import { NavigationMixin } from 'lightning/navigation';

export default class Cosp_PremiseCharacteristic extends OmniscriptBaseMixin(NavigationMixin(LightningElement)) {
    @api recordId;
    @track data = [];
    @track filteredData = [];
    @track displayData = [];
    @track minDate = '';
    @track maxDate = '';
    @track filterTypeDescription = '';
    @track showMoreVisible = false;

    @track PremiseCharacteristicColumns = [
        { label: 'Effective Date', fieldName: 'Effectivedate', hideDefaultActions: true },
        { label: 'Characteristic Type Description', fieldName: 'CharacteristicTypeDescription', hideDefaultActions: true },
        { label: 'Characteristic Value', fieldName: 'CharacteristicValue', hideDefaultActions: true },
        { label: 'Characteristic Value Description', fieldName: 'CharacteristicValueDescripti', hideDefaultActions: true }
    ];

    connectedCallback() {
        this.actionUtilClass = new OmniscriptActionCommonUtil();
        this.premisetriggerChainable();
    }

    premisetriggerChainable() {
        let input = { "Id": this.recordId };
        const params = {
            input: JSON.stringify(input),
            sClassName: 'vlocity_cmt.IntegrationProcedureService',
            sMethodName: 'CCSP_GetCurrentPremise',
            options: "{}"
        };
        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then(response => {
                let res = response.result.IPResult;
                if (Array.isArray(res)) {
                    this.premiseId = res[0].premiseId2;
                    this.premiseIdentifier = res[0].premiseIdentifier;
                } else {
                    this.premiseId = res.premiseId2;
                    this.premiseIdentifier = res.premiseIdentifier;
                }
                let temp = { payload2: this.premiseIdentifier };
                this.triggerChainable2(temp);
            })
            .catch(error => {
                console.error('Error fetching premise data:', error);
            });
    }

    triggerChainable2(de) {
        let input = { "Id": de.payload2 };
        const params = {
            input: JSON.stringify(input),
            sClassName: 'vlocity_cmt.IntegrationProcedureService',
            sMethodName: 'CCSP_PremiseCharacteristic',
            options: "{}"
        };
        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then(response => {
                let res = response.result.IPResult;
                this.data = res.map(item => ({
                    Effectivedate: this.formatDate(item.EffectiveDate),
                    CharacteristicValueDescripti: item.CharacteristicValueDescription,
                    CharacteristicTypeDescription: item.CharacteristicTypeDescription,
                    CharacteristicValue: item.CharacteristicValue
                }));
                this.applyFilters();
            })
            .catch(error => {
                console.error('Error fetching characteristic data:', error);
            });
    }

    formatDate(date) {
        return date;
    }

    // Handle input change for date filters with custom validation
    handleFilterChange(event) {
        const { name, value } = event.target;

        if (name === 'minDate') {
            this.minDate = value;
        } else if (name === 'maxDate') {
            this.maxDate = value;
        }

        // Perform custom validation on maxDate field
        this.applyCustomDateValidation();
    }

    applyCustomDateValidation() {
        const maxDateInput = this.template.querySelector('lightning-input[name="maxDate"]');

        if (this.minDate && this.maxDate) {
            const min = new Date(this.minDate);
            const max = new Date(this.maxDate);

            if (max < min) {
                maxDateInput.setCustomValidity('Maximum Date cannot be earlier than Minimum Date');
            } else {
                maxDateInput.setCustomValidity(''); // Clear the error
            }
        } else {
            maxDateInput.setCustomValidity(''); // Clear error if either date is missing
        }
        
        maxDateInput.reportValidity(); // Trigger validation message
    }

    applyFilters() {
        if (this.maxDate && new Date(this.maxDate) < new Date(this.minDate)) {
            this.filteredData = [];
            this.displayData = [];
            return;
        }

        this.filteredData = this.data.filter(item => {
            const itemDate = new Date(item.Effectivedate);
            const minDateValid = !this.minDate || itemDate >= new Date(this.minDate);
            const maxDateValid = !this.maxDate || itemDate <= new Date(this.maxDate);
            const typeDescriptionValid = !this.filterTypeDescription || item.CharacteristicTypeDescription.toLowerCase().includes(this.filterTypeDescription.toLowerCase());

            return minDateValid && maxDateValid && typeDescriptionValid;
        });

        this.displayData = this.filteredData.slice(0, 20);
        this.showMoreVisible = this.filteredData.length > 20;
    }

    handleSearch() {
        this.applyFilters();
    }

    handleReset() {
        this.minDate = '';
        this.maxDate = '';
        this.filterTypeDescription = '';
        this.applyFilters();
    }

    handleShowMore() {
        const currentLength = this.displayData.length;
        const nextSet = this.filteredData.slice(currentLength, currentLength + 20);
        this.displayData = [...this.displayData, ...nextSet];
        this.showMoreVisible = this.filteredData.length > this.displayData.length;
    }
}