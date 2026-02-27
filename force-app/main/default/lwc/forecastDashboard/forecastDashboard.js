import { LightningElement, wire, track } from 'lwc';
import getSummaries from '@salesforce/apex/ForecastApexProxy.getSummaries';
import generateAndPersist from '@salesforce/apex/ForecastApexProxy.generateAndPersist';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import USER_ID from '@salesforce/user/Id';
import Id from '@salesforce/user/Id';
import OWNER_NAME from '@salesforce/schema/User.Name';

/**
 * Note: LWC cannot call Apex REST directly due to CORS/session restrictions.
 * We provide an Apex proxy (ForecastApexProxy) that wraps the REST controller methods.
 * This file renders a simple chart using Chart.js dynamically loaded from static resource if available.
 */
export default class ForecastDashboard extends LightningElement {
    @track ownerOptions = [];
    selectedOwnerId = '';
    horizon = 4;

    chart; // Chart.js instance
    chartData;

    connectedCallback() {
        // Default to "All Owners"
        this.ownerOptions = [{ label: 'All Owners', value: '' }];
        // Add current user convenience option
        this.ownerOptions.push({ label: 'My Opportunities', value: USER_ID });
        // Initial load
        this.refreshForecast();
    }

    // Handlers
    handleOwnerChange(event) {
        this.selectedOwnerId = event.detail.value;
        this.refreshForecast();
    }
    handleHorizonChange(event) {
        const v = parseInt(event.detail.value, 10);
        if (!isNaN(v) && v > 0 && v <= 8) {
            this.horizon = v;
            this.refreshForecast();
        }
    }

    async refreshForecast() {
        try {
            const rows = await getSummaries({ ownerId: this.selectedOwnerId, horizon: this.horizon });
            this.chartData = this.transformToChart(rows);
            await this.renderChart();
        } catch (e) {
            this.notify('Error', e.body && e.body.message ? e.body.message : (e.message || 'Failed to load forecasts'), 'error');
        }
    }

    async generateAndPersist() {
        try {
            await generateAndPersist({
                ownerIds: this.selectedOwnerId ? [this.selectedOwnerId] : [],
                horizonQuarters: this.horizon,
                includeSeasonality: true
            });
            this.notify('Success', 'Forecast generated and saved', 'success');
            await this.refreshForecast();
        } catch (e) {
            this.notify('Error', e.body && e.body.message ? e.body.message : (e.message || 'Generate failed'), 'error');
        }
    }

    transformToChart(rows) {
        if (!rows || rows.length === 0) return null;
        // Group by owner then by period
        const labels = [];
        const predicted = [];
        const lower = [];
        const upper = [];
        // assume ordered by PeriodStart
        rows.forEach(r => {
            const q = `Q${r.fiscalQuarter} ${r.fiscalYear}`;
            labels.push(q);
            predicted.push(Number(r.predictedAmount || 0));
            lower.push(Number(r.lowerBound || 0));
            upper.push(Number(r.upperBound || 0));
        });
        return { labels, predicted, lower, upper };
    }

    async renderChart() {
        const canvas = this.template.querySelector('canvas.chart');
        if (!canvas || !this.chartData) return;

        // Lazy load Chart.js from CDN for simplicity
        if (!window.Chart) {
            await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
        }
        const ctx = canvas.getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: this.chartData.labels,
                datasets: [
                    {
                        label: 'Predicted',
                        data: this.chartData.predicted,
                        borderColor: '#1B96FF',
                        backgroundColor: 'rgba(27,150,255,0.1)',
                        tension: 0.2
                    },
                    {
                        label: 'Lower Bound',
                        data: this.chartData.lower,
                        borderColor: '#9CA3AF',
                        borderDash: [5, 5],
                        tension: 0.2
                    },
                    {
                        label: 'Upper Bound',
                        data: this.chartData.upper,
                        borderColor: '#9CA3AF',
                        borderDash: [5, 5],
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    loadScript(url) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.onload = resolve;
            s.onerror = reject;
            this.template.appendChild(s);
        });
    }

    notify(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
