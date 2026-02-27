import { LightningElement, api } from 'lwc';

export default class DailyVolumeChart extends LightningElement {
    _jsonData;
    chartData = [];
    companyInfo = {};
    periodInfo = {};
    currencyValue = 'USD';
    maxVolume = 0;
    chartHeight = 400;
    chartWidth = 0;
    barWidth = 0;
    padding = 60;
    chartDrawn = false;

    @api
    get jsonData() {
        return this._jsonData;
    }

    set jsonData(value) {
        this._jsonData = value;
        this.chartDrawn = false;
        this.processData();
    }

    connectedCallback() {
        this.processData();
    }

    renderedCallback() {
        if (this.chartData.length > 0 && this.template.querySelector('.chart-container') && !this.chartDrawn) {
            // Use setTimeout to ensure DOM is fully rendered
            setTimeout(() => {
                this.drawChart();
                this.chartDrawn = true;
            }, 0);
        }
    }

    processData() {
        try {
            let data;
            if (typeof this.jsonData === 'string') {
                data = JSON.parse(this.jsonData);
            } else {
                data = this.jsonData;
            }

            if (!data || !data.data || !Array.isArray(data.data)) {
                console.error('Invalid data format');
                return;
            }

            // Extract company and period information
            this.companyInfo = data.company || {};
            this.periodInfo = data.period || {};
            this.currencyValue = data.currency || 'USD';
            
            // Process daily data
            this.chartData = data.data.map((item, index) => {
                const volume = item.volume || 0;
                return {
                    date: item.date,
                    volume: volume,
                    formattedDate: this.formatDate(item.date),
                    dayLabel: this.getDayLabel(item.date),
                    index: index
                };
            });

            // Calculate max volume for scaling
            this.maxVolume = Math.max(...this.chartData.map(d => d.volume), 1);
            
            // Calculate bar width based on number of days
            const numBars = this.chartData.length;
            this.barWidth = Math.max(8, Math.min(30, (800 - (this.padding * 2)) / numBars));
            this.chartWidth = (this.barWidth * numBars) + (this.padding * 2);
        } catch (error) {
            console.error('Error processing data:', error);
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    getDayLabel(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    drawChart() {
        const svg = this.template.querySelector('.chart-svg');
        if (!svg) return;

        // Set SVG width
        svg.setAttribute('width', this.chartWidth);
        svg.setAttribute('viewBox', `0 0 ${this.chartWidth} ${this.chartHeight}`);

        // Clear previous content
        svg.innerHTML = '';

        // Draw bars
        this.chartData.forEach((item, index) => {
            const barHeight = (item.volume / this.maxVolume) * (this.chartHeight - this.padding * 2);
            const x = this.padding + (index * this.barWidth);
            const y = this.chartHeight - this.padding - barHeight;

            // Create bar
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', this.barWidth - 2);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', '#0176D3');
            rect.setAttribute('class', 'bar');
            rect.setAttribute('data-volume', item.volume);
            rect.setAttribute('data-date', item.date);
            
            // Add hover effect
            rect.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, item);
            });
            rect.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            svg.appendChild(rect);

            // Draw date labels (show every few days to avoid crowding)
            if (index % Math.ceil(this.chartData.length / 10) === 0 || index === this.chartData.length - 1) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + (this.barWidth / 2));
                text.setAttribute('y', this.chartHeight - this.padding + 20);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#706e6b');
                text.textContent = item.formattedDate;
                svg.appendChild(text);
            }
        });

        // Draw Y-axis labels
        const numLabels = 5;
        for (let i = 0; i <= numLabels; i++) {
            const value = (this.maxVolume / numLabels) * i;
            const y = this.chartHeight - this.padding - ((value / this.maxVolume) * (this.chartHeight - this.padding * 2));
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', this.padding - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('font-size', '11');
            text.setAttribute('fill', '#706e6b');
            text.textContent = this.formatVolume(value);
            svg.appendChild(text);

            // Draw grid line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this.padding);
            line.setAttribute('y1', y);
            line.setAttribute('x2', this.chartWidth - this.padding);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e5e5e5');
            line.setAttribute('stroke-width', '1');
            svg.insertBefore(line, svg.firstChild);
        }
    }

    formatVolume(volume) {
        if (volume >= 1000000) {
            return (volume / 1000000).toFixed(1) + 'M';
        } else if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return volume.toFixed(0);
    }

    showTooltip(event, item) {
        const tooltip = this.template.querySelector('.tooltip');
        if (tooltip) {
            const rect = event.target.getBoundingClientRect();
            const svgRect = this.template.querySelector('.chart-container').getBoundingClientRect();
            
            tooltip.style.display = 'block';
            tooltip.style.left = (rect.left - svgRect.left + rect.width / 2) + 'px';
            tooltip.style.top = (rect.top - svgRect.top - 40) + 'px';
            tooltip.innerHTML = `
                <div class="slds-text-heading_small">${item.formattedDate}</div>
                <div class="slds-text-body_small">Volume: ${this.formatVolume(item.volume)}</div>
            `;
        }
    }

    hideTooltip() {
        const tooltip = this.template.querySelector('.tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    get hasData() {
        return this.chartData && this.chartData.length > 0;
    }

    get companyName() {
        return this.companyInfo.name || 'N/A';
    }

    get companyTicker() {
        return this.companyInfo.ticker || 'N/A';
    }

    get periodRange() {
        if (this.periodInfo.start_date && this.periodInfo.end_date) {
            const start = new Date(this.periodInfo.start_date).toLocaleDateString();
            const end = new Date(this.periodInfo.end_date).toLocaleDateString();
            return `${start} - ${end}`;
        }
        return 'N/A';
    }

    get currency() {
        return this.currencyValue;
    }
}

