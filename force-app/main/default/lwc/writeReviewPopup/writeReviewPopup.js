import { LightningElement, api } from 'lwc';
import saveReview from '@salesforce/apex/ComponentListingReviewController.saveReview';

export default class WriteReviewPopup extends LightningElement {
  @api componentListingId;
  rating = 0;
  comment = '';
  stars = [];
  errorTimeout = 3000;

  connectedCallback() {
    // Initialize the stars array
    this.stars = [
      { id: 1, className: 'star-empty' },
      { id: 2, className: 'star-empty' },
      { id: 3, className: 'star-empty' },
      { id: 4, className: 'star-empty' },
      { id: 5, className: 'star-empty' },
    ];
  }

  handleStarClick(event) {
    const clickedStar = parseInt(event.currentTarget.dataset.index, 10);
    this.rating = clickedStar;
    this.updateStarRating();
  }

  updateStarRating() {
    this.stars = this.stars.map((star) => {
      const isFilled = star.id <= this.rating;
      const className = isFilled ? 'star-filled' : 'star-empty';
      return {
        ...star,
        className,
      };
    });
  }

  handleCommentChange(event) {
    this.comment = event.target.value;
  }

  handleClosePopup() {
    this.dispatchEvent(new CustomEvent('closepopup'));
  }

  async handleSubmitReview() {
    if (this.rating === 0 || !this.comment.trim()) {
      this.showToast('Please provide a rating and comment.', 'error',this.errorTimeout);
      return;
    }

    try {
      await saveReview({
        comment: this.comment,
        componentListingId: this.componentListingId,
        rating: this.rating,
      });

      // Dispatch event to notify parent about new review submission
      this.dispatchEvent(new CustomEvent('reviewsubmitted', {
        bubbles: true, // Bubbles up to the parent
        composed: true // Cross shadow DOM boundary
      }));

      this.handleClosePopup();
    } catch (error) {
      this.showToast(
        'Failed to submit review. Please try again.',
        'error',
        this.errorTimeout
      );
    }
  }

  showToast(message,variant,time) {
    const toastContainer = this.template.querySelector('c-toast-container');
    if (toastContainer) {
        toastContainer.showCustomToast(message, variant, time);
    }
  }
}