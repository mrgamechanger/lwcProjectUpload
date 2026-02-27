import { LightningElement } from 'lwc';
import getWeatherapi from '@salesforce/apex/Weatherapi.getWeatherapi'
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';
export default class WheatherApi extends OmniscriptBaseMixin(LightningElement) {
    city;
    imageUrl;
    condition;
    temperature;
    display = false;

    handleCityChange(event) {
        this.actionUtilClass = new OmniscriptActionCommonUtil();
        this.city = event.target.value;
    }

    handleGetResult() {
        this.display = true;
        getWeatherapi({ city: this.city }).then((response) => {
            console.log('Data received:', response);
            let result = JSON.parse(response);
            this.omniApplycallResp({'weatherData':result});
            this.imageUrl = result.current.condition.icon;
            this.condition = result.current.condition.text;
            this.temperature = result.current.temp_c;
        }).catch((error) => {
            this.display = false;
            this.condition = 'No location found';
            console.error('Error fetching data:', error);
        });
    }

    handleReset() {
        this.city = '';
        this.imageUrl = '';
        this.condition = '';
        this.temperature = '';
        this.display = false;

        // Clear the input field
        this.template.querySelector('form').reset();
    }
}