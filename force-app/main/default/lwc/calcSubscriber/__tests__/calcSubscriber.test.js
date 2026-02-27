import { createElement } from 'lwc';
import CalcSubscriber from 'c/calcSubscriber';

describe('c-calc-subscriber', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('calculates temperature conversion when temperature message is received', () => {
        const element = createElement('c-calc-subscriber', {
            is: CalcSubscriber
        });
        document.body.appendChild(element);

        // simulate Fahrenheit to Celsius
        element.handleMessage({
            calculationType: 'temperature',
            temperature: 212,
            conversion: 'toCelsius'
        });
        expect(element.result).toBeCloseTo(100);

        // simulate Celsius to Fahrenheit
        element.handleMessage({
            calculationType: 'temperature',
            temperature: 0,
            conversion: 'toFahrenheit'
        });
        expect(element.result).toBeCloseTo(32);
    });
});