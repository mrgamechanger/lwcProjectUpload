import { LightningElement } from 'lwc';

export default class Scrolling extends LightningElement {
    scrollCheck(event){
        console.log('Current value of the input: ' + event.target.scrollTop);
        console.log('Current value of the input: ' + event.target.scrollBottom);
      }
}