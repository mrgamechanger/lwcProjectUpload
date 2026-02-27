import { LightningElement,track } from 'lwc';

export default class CreateContactLDS extends LightningElement {

    @track contactName; 
    @track contactPhone; 
    @track contactEmail; 
     
    contactNameChangeHandler(event) 
    { 
        this.contactName=event.target.value; 
    } 
    contactNameChangeHandler(event) 
    { 
        this.contactPhone=event.target.value; 
    } 
    contactNameChangeHandler(event) 
    { 
        this.contactEmail=event.target.value; 
    } 

    
}