import { LightningElement, track, wire } from 'lwc';
import searchExercises from '@salesforce/apex/ExerciseApiCallout.searchExercises';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import FONTAWESOME_CSS from '@salesforce/resourceUrl/fontawesome_css';
import FONTAWESOME_JS from '@salesforce/resourceUrl/fontawesome_js';

export default class ExerciseDetails extends LightningElement {
    @track bodyPart = '';
    @track noofexercises = " ";
    @track exerciseDetails = [];
    @track isLoading = false;
    @track errorMessage = '';
    @track display = false;
    @track isFontAwesomeLoaded = false;

    bodyPartOptions = [
        { label: 'Select Body Part', value: '' },
        { label: 'Back', value: 'back' },
        { label: 'Cardio', value: 'cardio' },
        { label: 'Chest', value: 'chest' },
        { label: 'Lower Arms', value: 'lower arms' },
        { label: 'Lower Legs', value: 'lower legs' },
        { label: 'Neck', value: 'neck' },
        { label: 'Shoulders', value: 'shoulders' },
        { label: 'Upper Arms', value: 'upper arms' },
        { label: 'Upper Legs', value: 'upper legs' },
        { label: 'Waist', value: 'waist' }
    ];

    connectedCallback() {
        // Temporarily disable Font Awesome loading to avoid 404 errors
        // Promise.all([
        //     loadStyle(this, FONTAWESOME_CSS),
        //     loadScript(this, FONTAWESOME_JS)
        // ]).then(() => {
        //     console.log('Font Awesome loaded successfully');
        //     this.isFontAwesomeLoaded = true;
        // }).catch(error => {
        //     console.error('Error loading Font Awesome:', error);
        // });
        
        // Set Font Awesome as loaded to prevent errors
        this.isFontAwesomeLoaded = true;
    }

    handleInputChange(event) {
        // Safely handle the event object
        if (!event || !event.detail) {
            console.error('Invalid event object received');
            return;
        }
        
        const { name, value } = event.detail;
        if (name === 'bodyPart') {
            this.bodyPart = value;
        } else if (name === 'noofexercises') {
            this.noofexercises = parseInt(value, 10);
        }
    }

    handleSearch() {
        // Validate inputs before making the API call
        if (!this.bodyPart || this.bodyPart.trim() === '') {
            this.errorMessage = 'Please select a body part.';
            return;
        }
        
        if (!this.noofexercises || this.noofexercises <= 0) {
            this.errorMessage = 'Please enter a valid number of exercises.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.display = false;
        
        searchExercises({ bodyPart: this.bodyPart, noofexercises: this.noofexercises })
            .then(result => {
                this.isLoading = false;
                
                if (!result) {
                    this.errorMessage = 'No data received from the API. Please try again.';
                    this.display = false;
                    return;
                }
                
                try {
                    this.exerciseDetails = JSON.parse(result);
                    this.display = true;
                    this.omniApplycallResp({'exerciseData':this.exerciseDetails});
                    console.log("result", JSON.stringify(this.exerciseDetails));
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    this.errorMessage = 'Error processing the response. Please try again.';
                    this.display = false;
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.errorMessage = 'Failed to fetch exercises. Please try again later.';
                console.error('Error:', error);
                this.display = false;
            });
    }

    handleReset() {
        this.display = false;
        this.bodyPart = '';
        this.noofexercises = " ";
        this.exerciseDetails = [];
        this.errorMessage = '';
        this.template.querySelector('form').reset();
    }

    get isCardio() {
        return this.bodyPart === 'cardio';
    }
}