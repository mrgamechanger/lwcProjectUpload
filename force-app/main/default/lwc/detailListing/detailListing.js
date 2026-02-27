import { LightningElement, wire,api } from 'lwc';
import getListingDetails from '@salesforce/apex/ComponentListingController.getListingDetails';
import { NavigationMixin } from 'lightning/navigation';


export default class DetailListing extends NavigationMixin(LightningElement) {
  listingData;
  @api recordId;

  @wire(getListingDetails, { listingId: '$recordId' })
  wiredListingData({ error, data }) {
    if (data) {
      console.log('listingData',data);
      this.listingData = data;
    } else if (error) {
      console.error('Error fetching listing details:', JSON.stringify(error));
    }
  }

  handleClickView(event){
    const newRecordId = event.detail.listingId;
    this.recordId = newRecordId;
    console.log('recordId',newRecordId);
    
    // Navigate to the new record page using NavigationMixin
    this[NavigationMixin.GenerateUrl]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.newRecordId,
            objectApiName: 'Component_Listing__c', // Change this to your object API name
            actionName: 'view'
        }
    }).then(() => {
      console.log('Navigation successful');
    }).catch(error => {
        console.error('Navigation failed:', error);
    });
  }

  
}