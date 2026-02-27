import { LightningElement, api, track } from 'lwc';
import getRelatedListings from '@salesforce/apex/ComponentListingController.getRelatedListings';

export default class RelatedListings extends LightningElement {
  @api category;
  @track relatedListings = [];

  connectedCallback() {
    this.loadRelatedListings();
  }

  loadRelatedListings() {
    getRelatedListings({ category: this.category })
      .then((result) => {
        console.log('getRelatedListings', result);

        // Map the result to include listings and content versions, and construct image URL
        this.relatedListings = result.map((wrapper) => ({
          listing: wrapper.listing,
          contentVersion: wrapper.contentVersion,
          imageUrl: wrapper.contentVersion
            ? `/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${wrapper.contentVersion.Id}`
            : null
        }));
      })
      .catch((error) => {
        console.error('Error fetching related listings:', error);
      });
  }

  handleView() {
    // Implement navigation to view all related listings
    console.log('Navigate to all related listings');
  }
}