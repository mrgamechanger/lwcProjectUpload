import { LightningElement, track } from 'lwc';
import chartJs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';

export default class BMICalculator extends LightningElement {
    @track age = '';
    @track Gen = '';
    @track height = '';
    @track weight = '';
    @track bmi = 0;
    @track result = '';
    @track displayOutput = false;
    @track bmiHistory = [];
    chart;
    chartInitialized = false;
    chartJsLoaded = false;

    connectedCallback() {
        // Load Chart.js when the component is added to the DOM
        if (!this.chartJsLoaded) {
            loadScript(this, chartJs)
                .then(() => {
                    this.chartJsLoaded = true;
                    console.log('Chart.js loaded successfully');
                })
                .catch(error => {
                    console.error('Error loading Chart.js:', error);
                });
        }
    }

    renderedCallback() {
        // Initialize the chart once when the DOM is rendered and Chart.js is loaded
        if (this.chartJsLoaded && !this.chartInitialized) {
            this.initChart();
            this.chartInitialized = true;
        }
    }

    initChart() {
        // Ensure Chart.js and canvas are ready
        const ctx = this.template.querySelector('.bmi-chart').getContext('2d');
        this.chart = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'BMI Values',
                    data: [],
                    backgroundColor: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 40
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => `${tooltipItem.raw} (${this.bmiHistory[tooltipItem.dataIndex].category})`
                        }
                    }
                }
            }
        });
    }

    handleRadioChange(event) {
        this.Gen = event.target.value;
    }

    handler(event) {
        const { name, value } = event.target;
        if (name === 'height' || name === 'weight' || name === 'age') {
            this[name] = value;
        }
    }

    calculateBMI() {
        if (!this.chart) {
            console.warn('Chart is not initialized. Please wait.');
            return;
        }

        if (this.height && this.weight) {
            const heightInMeters = parseFloat(this.height) / 100;
            const weightInKg = parseFloat(this.weight);
            this.bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);

            this.displaybmi();
            this.displayOutput = true;

            this.bmiHistory.push({ bmi: this.bmi, category: this.result });
            this.updateChart();
        }
    }

    displaybmi() {
        if (this.bmi < 18.5) {
            this.result = "Underweight";
        } else if (this.bmi >= 18.5 && this.bmi <= 24.9) {
            this.result = "Normal Weight";
        } else if (this.bmi >= 25 && this.bmi <= 29.9) {
            this.result = "Overweight";
        } else if (this.bmi >= 30 && this.bmi <= 34.9) {
            this.result = "Moderately obese";
        } else if (this.bmi >= 35 && this.bmi <= 39.9) {
            this.result = "Severely obese";
        } else if (this.bmi >= 40) {
            this.result = "Very severely obese";
        }
    }

    updateChart() {
        if (this.chart) {
            this.chart.data.labels = this.bmiHistory.map((_, index) => `Entry ${index + 1}`);
            this.chart.data.datasets[0].data = this.bmiHistory.map(entry => entry.bmi);
            this.chart.data.datasets[0].backgroundColor = this.bmiHistory.map(entry => this.getCategoryColor(entry.category));
            this.chart.update();
        } else {
            console.error('Chart is not initialized');
        }
    }

    getCategoryColor(category) {
        if (category === 'Underweight') return 'rgba(255, 159, 64, 0.2)';
        if (category === 'Normal Weight') return 'rgba(75, 192, 192, 0.2)';
        if (category === 'Overweight') return 'rgba(255, 206, 86, 0.2)';
        if (category === 'Moderately obese') return 'rgba(255, 140, 140, 0.2)';
        if (category === 'Severely obese') return 'rgba(255, 99, 132, 0.2)';
        return 'rgba(180, 30, 30, 0.2)';
    }
}