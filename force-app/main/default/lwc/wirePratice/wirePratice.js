import { LightningElement ,wire,track} from 'lwc';
import getContactname from '@salesforce/apex/ContactFetch.getContactname';
import getAccountList from '@salesforce/apex/AccountList.getAccountList';
import usedId from '@salesforce/user/Id'
export default class WirePratice extends LightningElement {

  conids=[];
   
    @wire(getAccountList)
    wiredDatalist({ error, data }) {
      if (data) {
        this.Accountdata=data;
        console.log('Data of wire', data);
      } else if (error) {
         console.error('Error:', error);
      }
    }
     @wire(getContactname )
         wiredData({ error, data }) {
           if (data) {
             this.contactdata=data;
           }
           else if (error) {
              console.error('Error:', error);
           }
         }
  connectedCallback() {

   
    getAccountList()
        .then((result) => {
            this.data = result;
            console.log('Data of connectedcallback', result);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

    columnsList = [
        { label: 'Contact Name', fieldName: 'Name', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'number' }
    ];
       @track contactdata;
        @track paramName;
        @track Accountdata;
        handleinput(event)
        {
            this.paramName=event.target.value;
        }

        @wire(getContactname, { Name: '$paramName' })
        wiredData({ error, data }) {
            if (data) {
                this.contactdata = data;
    
                // Extract Account IDs
                this.conids = [...data.map((item) => item.AccountId)];
    
                console.log('Contact Data:', data);
                console.log('Extracted Account IDs:', this.conids);
            } else if (error) {
                console.error('Error fetching contacts:', error);
            }
        }

}