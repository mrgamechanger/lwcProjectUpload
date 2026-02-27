// objectFieldDropdown.js
import { LightningElement, wire, track } from 'lwc';
import getAllObjects from '@salesforce/apex/ObjectFieldController.getAllObjects';
import getFieldsForObject from '@salesforce/apex/ObjectFieldController.getFieldsForObject';
import queryRecords from '@salesforce/apex/ObjectFieldController.queryRecords';
import createRecord from '@salesforce/apex/ObjectFieldController.createRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ObjectFieldDropdown extends LightningElement {
    @track objectOptions = [];
    @track fieldOptions = [];
    @track selectedFields = [];
    @track fieldValues = {};
    @track whereClause = '';
    @track queriedRecords = []; // To store queried records
    @track columns = []; // To define columns for the data table
    selectedObject;

    @wire(getAllObjects)
    wiredObjects({ error, data }) {
        if (data) {
            this.objectOptions = data.map(obj => ({ label: obj, value: obj }));
        } else if (error) {
            console.error(error);
        }
    }

    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        this.fieldValues = {};

        getFieldsForObject({ objectName: this.selectedObject })
            .then(fields => {
                this.fieldOptions = fields.map(field => ({ label: field, value: field }));
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleFieldSelectChange(event) {
        this.selectedFields = Array.from(event.detail.value);

        // Dynamically set columns based on selected fields
        this.columns = this.selectedFields.map(field => ({
            label: field,
            fieldName: field,
            type: 'text'
        }));
    }

    handleFieldValueChange(event) {
        this.fieldValues[event.target.dataset.fieldName] = event.target.value;
    }

    handleWhereClauseChange(event) {
        this.whereClause = event.target.value;
    }

    handleGenerateData() {
        createRecord({ objectName: this.selectedObject, fieldValues: this.fieldValues })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: result,
                        variant: 'success',
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    handleQueryRecords() {
        queryRecords({ objectName: this.selectedObject, fields: this.selectedFields, whereClause: this.whereClause })
            .then(records => {
                this.queriedRecords = records; // Store the queried records to display
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Query Success',
                        message: `${records.length} records retrieved.`,
                        variant: 'success',
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    get fieldInputOptions() {
        return this.fieldOptions.map(field => {
            return {
                ...field,
                label: `Set Value for ${field.label}`
            };
        });
    }
}