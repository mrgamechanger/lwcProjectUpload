import { LightningElement, api, track } from 'lwc';

export default class ReviewList extends LightningElement {
    @api reviews = []; // All reviews passed from parent
    @track displayedReviews = []; // Reviews currently displayed
    @track isLoading = false;
    @track error;

    batchSize = 5; // Number of reviews to load per scroll
    currentIndex = 0; // Index to track how many reviews have been loaded so far

    connectedCallback() {
        this.loadInitialReviews();
    }

    // Load the initial batch of reviews
    loadInitialReviews() {
        this.displayedReviews = this.reviews.slice(0, this.batchSize);
        this.currentIndex = this.batchSize;
    }

    // Load more reviews when user scrolls
    loadMoreReviews() {
        if (this.isLoading) return;

        this.isLoading = true;

        // Load the next batch of reviews
        const nextBatch = this.reviews.slice(this.currentIndex, this.currentIndex + this.batchSize);
        this.displayedReviews = [...this.displayedReviews, ...nextBatch];
        this.currentIndex += this.batchSize;

        // Check if we've loaded all reviews
        if (this.currentIndex >= this.reviews.length) {
            this.isLoading = false;
        }
    }

    // Handle scroll event
    handleScroll(event) {
        const element = event.target;

        // Check if user has scrolled to the bottom
        if (element.scrollHeight - element.scrollTop === element.clientHeight) {
            this.loadMoreReviews();
        }
    }

    // Date formatting function
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    }

    // Generate star ratings
    generateRatingStars(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating ? 'star-filled' : 'star-empty');
        }
        return stars;
    }

    // Getter to return processed reviews for display
    get processedReviews() {
        return this.displayedReviews.map((review) => ({
            ...review,
            reviewerName: review.reviewerName || 'Anonymous',
            formattedDate: this.formatDate(review.CreatedDate),
            ratingStars: this.generateRatingStars(review.Rating__c)
        }));
    }
}