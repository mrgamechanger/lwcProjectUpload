import { LightningElement, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';

const FIELDS = ['User.Name', 'User.Email', 'User.Phone'];

export default class UserInformation extends LightningElement {
    @wire(getRecord, { recordId: USER_ID, fields: FIELDS })
    user;

    get userName() {
        return this.user.data.fields.Name.value;
    }

    get userEmail() {
        return this.user.data.fields.Email.value;
    }

    get userPhone() {
        return this.user.data.fields.Phone.value;
    }
}