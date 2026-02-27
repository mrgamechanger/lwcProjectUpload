import { LightningElement, api } from 'lwc';

export default class AccountDetailsLwc extends LightningElement {
    @api jsonData; // Data passed from the OmniScript
    @api jsonDef; // OmniScript step definition

    // Compute fields for display
    get accountName() {
        return this.jsonData?.AccountInformation?.['Entername-Block']?.Name || 'N/A';
    }

    get accountPhone() {
        return this.jsonData?.AccountInformation?.['Entername-Block']?.Phone || 'N/A';
    }

    get accountEmail() {
        return this.jsonData?.AccountInformation?.['Entername-Block']?.email || 'N/A';
    }

    get accountAnnualRevenue() {
        return this.jsonData?.AccountInformation?.['Entername-Block']?.AnnualRevenvue || 'N/A';
    }
}
