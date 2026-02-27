import { LightningElement, api, track } from 'lwc';
import getZipFileUrl from '@salesforce/apex/ComponentListingController.getZipFileUrl';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class ComponentDetail extends NavigationMixin(LightningElement) {
  @api listingData;
  @track tags = [];
  recordId;

  connectedCallback() {
    this.recordId = this.listingData.Id;
    this.processTags();
  }

  get formattedDate() {
    const date = new Date(this.listingData.CreatedDate);
    return date.toLocaleDateString();
  }

  processTags() {
    if (this.listingData.Tags__c) {
      this.tags = this.listingData.Tags__c
        .split(/[;,]/)
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    }
  }

  handleLinkedInShare() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.listingData.Title__c);
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
    window.open(linkedInShareUrl, '_blank');
  }

  getBaseUrl(){
    let baseUrl = 'https://'+location.host+'/';
    return baseUrl;
  }

  handleDownload() {
    let hasError = false;
    // Implement download functionality
    console.log('Download clicked');
    console.log(this.recordId,'this.recordId');
    // Call Apex to get the ZIP file URL
    getZipFileUrl({ recordId: this.recordId })
    .then((zipFileUrl) => {
        // Create a hidden anchor element to trigger the download
        if(zipFileUrl == null || zipFileUrl === '' || zipFileUrl === false) {
           console.log('Download not allowed');
           hasError = true;
            //show toast event that currently no download is available for this component
            this.showToast('No download available for this component', 'error',6000);
        }
        
        //return if error
        if(hasError){
          return;
        }
        let url = this.getBaseUrl() + zipFileUrl;
        console.log('url',url)
        this[NavigationMixin.Navigate]({
          type: 'standard__webPage',
          attributes: {
              url: url
          }}, false 
        );
        // console.log('zipFileUrl:', );
        // const link = document.createElement('a');
        // link.href = this.getBaseUrl() + zipFileUrl; // Use the URL returned from Apex
        // link.target = '_blank'; // Open in a new tab (if necessary)
        // link.download = 'file.zip'; // Set the download file name (optional)
        // document.body.appendChild(link);
        // link.click(); // Trigger the download
        // document.body.removeChild(link); // Clean up
    })
    .catch((error) => {
        console.error('Error fetching ZIP file URL:', JSON.stringify(error));
        // Show toast event for the error
        const event = new ShowToastEvent({
          title: 'Error',
          message: 'Failed to retrieve download link',
          variant: 'error',
        });
      this.dispatchEvent(event);
    });  
  }

  showToast(message,variant,time) {
    const toastContainer = this.template.querySelector('c-toast-container');
    if (toastContainer) {
        toastContainer.showCustomToast(message, variant, time);
    }
  }
}