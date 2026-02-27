import { LightningElement, api, track } from 'lwc';

export default class AuthorComponent extends LightningElement {
    @api authorData;
    @api category;
    @track isModalOpen = false;

    handleLinkedInProfile() {
        if (this.authorData.LinkedIn_Profile__c) {
            window.open(this.authorData.LinkedIn_Profile__c, '_blank');
        }
    }

    openRelatedListings() {
        const relatedListingsPopup = this.template.querySelector('c-related-listings-pop-up');
        if (relatedListingsPopup) {
            relatedListingsPopup.openModal();
            this.isModalOpen = true;
        }
    }

    closeRelatedListings() {
        this.isModalOpen = false;
    }
}