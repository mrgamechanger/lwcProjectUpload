import { createElement } from 'lwc';
import CalcPublisher from 'c/calcPublisher';
import { publish } from 'lightning/messageService';

// mock the publish method
jest.mock('lightning/messageService', () => {
    return {
        publish: jest.fn(),
        MessageContext: jest.fn()
    };
});

describe('c-calc-publisher', () => {
    afterEach(() => {
        // cleanup DOM and reset mocks
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        publish.mockClear();
    });

    it('publishes temperature conversion message when button clicked', () => {
        const element = createElement('c-calc-publisher', {
            is: CalcPublisher
        });
        document.body.appendChild(element);

        // set properties directly to avoid querying inputs
        element.temperature = 100;
        element.conversion = 'toCelsius';

        // invoke method
        element.handleCalculateTemperature();

        expect(publish).toHaveBeenCalled();
        const [context, channel, message] = publish.mock.calls[0];
        expect(message.calculationType).toBe('temperature');
        expect(message.temperature).toBe(100);
        expect(message.conversion).toBe('toCelsius');
    });
});