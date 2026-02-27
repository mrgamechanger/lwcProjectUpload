import { LightningElement, api, track } from 'lwc';
import getRelatedListings from '@salesforce/apex/ComponentListingController.getRelatedListings';

export default class RelatedListingsPopUp extends LightningElement {
    @api category;
    @api isModalOpen = false;
    @track relatedListings = [];

    connectedCallback() {
        if (this.isModalOpen) {
            this.loadRelatedListings();
        }
    }

    @api
    openModal() {
        this.isModalOpen = true;
        this.loadRelatedListings();
    }

    closeModal() {
        this.isModalOpen = false;
        this.dispatchEvent(new CustomEvent('relatedlistingspopupclosed'));
    }

    loadRelatedListings() {
        getRelatedListings({ category: this.category })
            .then((result) => {
                this.relatedListings = result.map((wrapper) => ({
                    listing: wrapper.listing,
                    imageUrl: wrapper.imageUrl || '/path/to/default/image.png'
                }));
            })
            .catch((error) => {
                console.error('Error fetching related listings:', error);
            });
    }

    get hasListings() {
        return this.relatedListings.length > 0;
    }

    openListing(event) {
        const listingId = event.target.dataset.listingId;
        console.log('Listing ID:', listingId);
        const baseUrl = 'https://sfenthusiasts--partialsb.sandbox.my.site.com/listing/';
        const fullUrl = `${baseUrl}?recordId=${listingId}`;
        window.location.href = fullUrl; // Redirect the browser to the new URL     
        // this.dispatchEvent(new CustomEvent('listingselected', { detail: { listingId },
        //     bubbles: true, // Allow event to bubble up
        //     composed: true  // Allow event to escape shadow DOM boundary
        // }));
        // this.closeModal();
    }
}