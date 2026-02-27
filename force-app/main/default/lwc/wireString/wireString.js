import { LightningElement,wire } from 'lwc';
import AccountSearchbystring from '@salesforce/apex/AccountS.AccountSearchbystring'
export default class WireString extends LightningElement {

    

searchvalue=''


    @wire(AccountSearchbystring ,{
        str: '$searchvalue'
    }) Acclist


    get options() {
        return [
            { label: 'Customer - Channel', value: 'Customer - Channel' },
            { label: 'Customer - Direct', value: 'Customer - Direct' },
            
        ];
    }

    handleChange(event) {
        this.searchvalue = event.detail.value;
    }
}