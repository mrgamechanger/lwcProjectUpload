import { LightningElement, track } from 'lwc';
import extractTextFromImage from '@salesforce/apex/ImageTextExtractorController.extractTextFromImage';

export default class ImageTextExtractor extends LightningElement {
    @track previewUrl;
    @track extractedText;
    @track error;
    @track isLoading = false;

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.isLoading = true;
            this.error = null;
            this.extractedText = null;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrl = e.target.result;
                this.processImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    async processImage(base64Image) {
        try {
            const result = await extractTextFromImage({ base64Image });
            const parsedResult = JSON.parse(result);
            
            if (parsedResult.probabilities && parsedResult.probabilities.length > 0) {
                // Combine all detected text
                this.extractedText = parsedResult.probabilities
                    .map(item => item.label)
                    .join('\n');
            } else {
                this.extractedText = 'No text detected in the image.';
            }
        } catch (error) {
            this.error = 'Error processing image: ' + error.body.message;
        } finally {
            this.isLoading = false;
        }
    }
} 