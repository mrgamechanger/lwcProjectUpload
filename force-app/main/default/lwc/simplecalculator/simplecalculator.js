import { LightningElement,track } from 'lwc';

export default class Simplecalculator extends LightningElement {

    number1 = "";
    number2 = "";
   @track result="";
    handernumber(event)
    {
        const{name,value}=event.target;
        if(name=='number1')
        {
            this.number1=value;
            console.log(this.number1);
        }
        else if(name=='number2')
        {
            this.number2=value;
            console.log(this.number2);
        }
    }

    handleCalculation(event) {
        const label = event.target.label;
        const num1 = parseFloat(this.number1); //string to number
        const num2 = parseFloat(this.number2);

        if (label === 'Add') {
            this.result = num1 + num2;
        } else if (label === 'subtact') {
            this.result = num1 - num2;
        } else if (label === 'multiply') {
            this.result = num1 * num2;
        } else if (label === 'divide') {
            this.result = num1 / num2;
        }
        else if(label === 'percent')
        {
            this.result = num1 / num2;
            this.result = this.result * 100;
            this.result = this.result + "%";
        }else if(label==='reset')
        {
            this.result="";
            this.number1="";
            this.number2="";
           
            this.template.querySelector('form').reset();
        }

        console.log(this.result);
    }
    
}