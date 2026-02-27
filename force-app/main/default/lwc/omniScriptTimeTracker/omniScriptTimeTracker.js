import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import trackComponentInteraction from '@salesforce/apex/OmniStudioTrackingService.trackComponentInteraction';

export default class OmniScriptTimeTracker extends OmniscriptBaseMixin(LightningElement) {
    @api startTime;
    @api stepName;
    
    connectedCallback() {
        this.startTime = Date.now();
    }
    
    disconnectedCallback() {
        const endTime = Date.now();
        const timeSpent = endTime - this.startTime;
        
        // Get OmniScript details
        const omniScript = this.omniJsonData;
        if (omniScript) {
            trackComponentInteraction({
                componentType: 'OmniScript',
                componentName: omniScript.scriptName,
                stepName: this.stepName,
                timeSpent: timeSpent
            }).catch(error => {
                console.error('Error tracking time:', error);
            });
        }
    }
} 