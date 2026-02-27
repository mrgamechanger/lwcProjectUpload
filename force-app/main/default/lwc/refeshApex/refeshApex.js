import { LightningElement,wire,track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountContoller.getAccounts';
import {ShowToastEvent} from 'lightning/platformShowToastEvent'
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const COLS = [
  {label: 'ID', fieldName: 'Id'},
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'PHONE', fieldName: 'Phone', type: 'text' },
    { label: 'INDUSTRY', fieldName: 'Industry', type: 'text' }
    
  ];

export default class RefeshApex extends LightningElement {


        cols = COLS;
        @track selectedRecord;
        @track accountList = [];
        @track error;
        @track wiredAccountList = [];
      
        @wire(getAccounts) 
        accList(result) {
          this.wiredAccountList = result;
      
          if (result.data) {
            this.accountList = result.data;
            this.error = undefined;
          } else if (result.error) {
            this.error = result.error;
            this.accountList = [];
          }
        }
      
        handelSelection(event) {
          if (event.detail.selectedRows.length > 0) {
            this.selectedRecord = event.detail.selectedRows[0].Id;
          }
        }

        deleteRecord() {
          deleteRecord(this.selectedRecord)
            .then(() => {
                 refreshApex(this.wiredAccountList);
                  const showSuccess=new ShowToastEvent({ 
                      title:'Deleted Account', 
                      message:'The account is deleted successfully', 
                      variant:'Success', 
                  }); 
                  this.dispatchEvent(showSuccess); 
              
            })
            .catch(error => {

  
              const showError=new ShowToastEvent({ 
                title:'Deleted Account', 
                message:'error occured while deleting', 
                variant:'error', 
            }); 
            this.dispatchEvent(showError); 
            })
        }
}