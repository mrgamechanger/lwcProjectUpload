import { LightningElement } from 'lwc';
import generateImage from '@salesforce/apex/FluxController.generateImage';

export default class FluxImageGenerator extends LightningElement {
    prompt = 'Astronaut riding a horse';
    imageData;
    isLoading = false;
    error;

    handlePromptChange(event) {
        this.prompt = event.target.value;
    }

    async handleGenerate() {
        this.isLoading = true;
        this.error = null;
        this.imageData = null;

        try {
            const base64Data = await generateImage({ prompt: this.prompt });
            this.imageData = `data:image/png;base64,${base64Data}`;
        } catch(error) {
            this.error = this.parseError(error);
            console.error('Generation error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    parseError(error) {
        return error.body?.message || error.message || 'Unknown error occurred';
    }

    get imageUrl() {
        return this.imageData;
    }
}