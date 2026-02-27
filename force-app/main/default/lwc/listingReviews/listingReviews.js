import { LightningElement, api, track } from 'lwc';
import getReviews from '@salesforce/apex/ComponentListingController.getReviews';

export default class ListingReviews extends LightningElement {
  @api recordId;
  @track reviews = [];
  showReviewPopup = false;
  averageRating = 0;
  totalReviews = 0;
  errorTimeout = 3000;

  connectedCallback() {
    this.loadReviews();
  }

  loadReviews() {
    getReviews({ listingId: this.recordId })
      .then((result) => {
        console.log('reviews:', JSON.stringify(result));
        this.reviews = result;
        this.totalReviews = result.length;
        this.calculateAverageRating();
      })
      .catch((error) => {
        console.error('Error fetching reviews:', error);
      });
  }

  calculateAverageRating() {
    if (this.reviews.length > 0) {
      const total = this.reviews.reduce((sum, review) => sum + review.Rating__c, 0);
      this.averageRating = (total / this.reviews.length).toFixed(1);
    }
  }

  handleWriteReview() {
    this.showReviewPopup = true;
  }

  handleCloseReviewPopup() {
    this.showReviewPopup = false;
    this.loadReviews(); // Refresh reviews after new review is submitted
  }

  handleViewAllReviews() {
    // Implement navigation to the full reviews page
    console.log('Navigate to all reviews page');
  }

  handleReviewSubmitted() {
    // Reload reviews after a new review is submitted
    this.loadReviews();
    this.showReviewPopup = false; // Close the popup after reload
    this.showToast('Review submitted successfully!', 'success',this.errorTimeout);
  }

  // Add event handler
  handleReviewsLoaded(event) {
    const reviews = event.detail.reviews;
    this.totalReviews = reviews.length;
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + review.Rating__c, 0);
      this.averageRating = (total / reviews.length).toFixed(1);
    } else {
      this.averageRating = 0;
    }
  }

  showToast(message,variant,time) {
    const toastContainer = this.template.querySelector('c-toast-container');
    if (toastContainer) {
        toastContainer.showCustomToast(message, variant, time);
    }
  }
}