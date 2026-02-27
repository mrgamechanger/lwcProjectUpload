// Parent Component: ComponentListingWrapper
// This LWC component acts as a wrapper for the Detail Listing and its child components
import { LightningElement, api,wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class ComponentListingWrapper extends LightningElement {
    @api recordId;

    @wire(CurrentPageReference)
    setCurrentPageReference(pageRef) {
        if (pageRef && pageRef.state.recordId) {
            this.recordId = pageRef.state.recordId;
        }
    }

    // You can now use this.recordId in your component logic
    connectedCallback() {
        console.log('loc',window.location.href)
        if (this.recordId) {
            console.log('Record ID retrieved from URL:', this.recordId);
        } else {
            console.log('recordId not Found');
            
        }
    }
}