import { LightningElement, wire, track } from 'lwc';
import getTrackingData from '@salesforce/apex/OmniStudioTrackingService.getTrackingData';
import getTrackingStats from '@salesforce/apex/OmniStudioTrackingService.getTrackingStats';

export default class OmniStudioTrackingDashboard extends LightningElement {
    @track trackingData;
    @track trackingStats;
    @track error;
    @track selectedComponentType = '';
    @track selectedComponentName = '';
    @track startDate;
    @track endDate;
    
    @track columns = [
        { label: 'Component Type', fieldName: 'ComponentType__c', type: 'text' },
        { label: 'Component Name', fieldName: 'ComponentName__c', type: 'text' },
        { label: 'Step Name', fieldName: 'StepName__c', type: 'text' },
        { label: 'Time Spent (ms)', fieldName: 'TimeSpent__c', type: 'number' },
        { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' },
        { label: 'User', fieldName: 'User__c', type: 'text' }
    ];

    @wire(getTrackingData, { 
        componentType: '$selectedComponentType', 
        componentName: '$selectedComponentName',
        startDate: '$startDate',
        endDate: '$endDate'
    })
    wiredTrackingData({ error, data }) {
        if (data) {
            this.trackingData = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.trackingData = undefined;
        }
    }

    @wire(getTrackingStats, { 
        componentType: '$selectedComponentType',
        startDate: '$startDate',
        endDate: '$endDate'
    })
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

    get averageTimeSpent() {
        return this.trackingStats?.averageTimeSpent || [];
    }

    get totalInteractions() {
        return this.trackingStats?.totalInteractions || [];
    }

    get stepWiseTime() {
        return this.trackingStats?.stepWiseTime || [];
    }

    handleComponentTypeChange(event) {
        this.selectedComponentType = event.target.value;
    }

    handleComponentNameChange(event) {
        this.selectedComponentName = event.target.value;
    }

    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
    }

    get componentTypeOptions() {
        return [
            { label: 'All Components', value: '' },
            { label: 'OmniScript', value: 'OmniScript' },
            { label: 'Integration Procedure', value: 'IntegrationProcedure' },
            { label: 'FlexiCard', value: 'FlexiCard' },
            { label: 'LWC', value: 'LWC' }
        ];
    }
} 