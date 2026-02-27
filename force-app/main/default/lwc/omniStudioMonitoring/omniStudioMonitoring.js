import { LightningElement, wire, track } from 'lwc';
import getTrackingData from '@salesforce/apex/VlocityTrackingService.getTrackingData';
import getTrackingStats from '@salesforce/apex/VlocityTrackingService.getTrackingStats';

export default class OmniStudioMonitoring extends LightningElement {
    @track trackingData;
    @track trackingStats;
    @track error;
    @track selectedComponentType = '';
    @track selectedEventType = '';
    
    @track columns = [
        { label: 'Component Type', fieldName: 'ComponentType__c', type: 'text' },
        { label: 'Event Type', fieldName: 'EventType__c', type: 'text' },
        { label: 'Elapsed Time (ms)', fieldName: 'ElapsedTime__c', type: 'number' },
        { label: 'Timestamp', fieldName: 'Timestamp__c', type: 'date' },
        { label: 'Outcome', fieldName: 'Outcome__c', type: 'text' }
    ];

    @wire(getTrackingData, { componentType: '$selectedComponentType', eventType: '$selectedEventType' })
    wiredTrackingData({ error, data }) {
        if (data) {
            this.trackingData = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.trackingData = undefined;
        }
    }

    @wire(getTrackingStats)
    wiredTrackingStats({ error, data }) {
        if (data) {
            this.trackingStats = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.trackingStats = undefined;
        }
    }

    get hasData() {
        return this.trackingData && this.trackingData.length > 0;
    }

    get averageExecutionTimes() {
        return this.trackingStats?.averageExecutionTimes || [];
    }

    get eventCounts() {
        return this.trackingStats?.eventCounts || [];
    }

    get successRates() {
        return this.trackingStats?.successRates || [];
    }

    handleComponentTypeChange(event) {
        this.selectedComponentType = event.target.value;
    }

    handleEventTypeChange(event) {
        this.selectedEventType = event.target.value;
    }

    get componentTypeOptions() {
        return [
            { label: 'All Components', value: '' },
            { label: 'OmniScript', value: 'OmniScript' },
            { label: 'FlexCard', value: 'FlexCard' },
            { label: 'Integration Procedure', value: 'IntegrationProcedure' }
        ];
    }

    get eventTypeOptions() {
        return [
            { label: 'All Events', value: '' },
            { label: 'View', value: 'View' },
            { label: 'Done', value: 'Done' },
            { label: 'SaveForLater', value: 'SaveForLater' },
            { label: 'Cancel', value: 'Cancel' }
        ];
    }
} 