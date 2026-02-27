import { LightningElement } from 'lwc';
import salesforceLogo from '@salesforce/resourceUrl/SalesforceLogoLWC';

export default class StaticResource extends LightningElement {
    salesforceLogoUrl = salesforceLogo;
}