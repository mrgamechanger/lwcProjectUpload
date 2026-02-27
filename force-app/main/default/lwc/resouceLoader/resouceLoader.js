import { LightningElement } from 'lwc';
import chartJs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';

export default class ChartContainer extends LightningElement {
    chartInitialized = false; // Flag to avoid re-initialization

    renderedCallback() {
        if (this.chartInitialized) {
            return; // Do not reinitialize
        }

        // Load Chart.js library
        loadScript(this, chartJs)
            .then(() => {
                this.initializeCharts();
                this.chartInitialized = true;
            })
            .catch(error => {
                console.error('Error loading Chart.js', error);
            });
    }

    initializeCharts() {
        // Initialize Pie Chart
        const pieCtx = this.template.querySelector('.pie-chart').getContext('2d');
        new window.Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Apex', 'LWC', 'Flow', 'Admin', 'Trigger', 'Vlocity'],
                datasets: [{
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
            }
        });

        // Initialize Bar Chart
        const barCtx = this.template.querySelector('.bar-chart').getContext('2d');
        new window.Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Apex', 'LWC', 'Flow', 'Admin', 'Trigger', 'Vlocity'],
                datasets: [{
                    label: 'Skills',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}