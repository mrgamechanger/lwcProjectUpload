import { LightningElement, api } from 'lwc';

const DEFAULT_DATA = {
    metadata: {
        entity_id: 'HOME-12345',
        location: 'Shyamnagar, Jamshedpur',
        unit_of_measurement: 'kWh',
        description:
            'Daily electricity consumption data for a residential property (23 Nov 2025 - 22 Dec 2025)'
    },
    consumption_records_daily: [
        { date: '2025-11-23', consumption_kWh: 3.2, cost_inr: 22.4 },
        { date: '2025-11-24', consumption_kWh: 4.1, cost_inr: 28.7 },
        { date: '2025-11-25', consumption_kWh: 3.8, cost_inr: 26.6 },
        { date: '2025-11-26', consumption_kWh: 4.5, cost_inr: 31.5 },
        { date: '2025-11-27', consumption_kWh: 3.5, cost_inr: 24.5 },
        { date: '2025-11-28', consumption_kWh: 4.2, cost_inr: 29.4 },
        { date: '2025-11-29', consumption_kWh: 3.9, cost_inr: 27.3 },
        { date: '2025-11-30', consumption_kWh: 4.8, cost_inr: 33.6 },
        { date: '2025-12-01', consumption_kWh: 4.1, cost_inr: 28.7 },
        { date: '2025-12-02', consumption_kWh: 3.6, cost_inr: 25.2 },
        { date: '2025-12-03', consumption_kWh: 4.3, cost_inr: 30.1 },
        { date: '2025-12-04', consumption_kWh: 3.7, cost_inr: 25.9 },
        { date: '2025-12-05', consumption_kWh: 4.6, cost_inr: 32.2 },
        { date: '2025-12-06', consumption_kWh: 3.4, cost_inr: 23.8 },
        { date: '2025-12-07', consumption_kWh: 4.4, cost_inr: 30.8 },
        { date: '2025-12-08', consumption_kWh: 3.9, cost_inr: 27.3 },
        { date: '2025-12-09', consumption_kWh: 4.7, cost_inr: 32.9 },
        { date: '2025-12-10', consumption_kWh: 3.3, cost_inr: 23.1 },
        { date: '2025-12-11', consumption_kWh: 4.0, cost_inr: 28.0 },
        { date: '2025-12-12', consumption_kWh: 3.8, cost_inr: 26.6 },
        { date: '2025-12-13', consumption_kWh: 4.5, cost_inr: 31.5 },
        { date: '2025-12-14', consumption_kWh: 3.6, cost_inr: 25.2 },
        { date: '2025-12-15', consumption_kWh: 4.2, cost_inr: 29.4 },
        { date: '2025-12-16', consumption_kWh: 3.9, cost_inr: 27.3 },
        { date: '2025-12-17', consumption_kWh: 4.8, cost_inr: 33.6 },
        { date: '2025-12-18', consumption_kWh: 3.5, cost_inr: 24.5 },
        { date: '2025-12-19', consumption_kWh: 4.1, cost_inr: 28.7 },
        { date: '2025-12-20', consumption_kWh: 3.7, cost_inr: 25.9 },
        { date: '2025-12-21', consumption_kWh: 4.4, cost_inr: 30.8 },
        { date: '2025-12-22', consumption_kWh: 4.0, cost_inr: 28.0 }
    ]
};

export default class ElectricityConsumptionBarChart extends LightningElement {
    _data = DEFAULT_DATA;
    showLegend = true;

    get subtitle() {
        const meta = this._data?.metadata;
        if (!meta) return '';
        return `${meta.location} • ${meta.description}`;
    }

    @api
    set chartData(value) {
        if (value && value.consumption_records_daily) {
            this._data = value;
            this.renderChart();
        }
    }
    get chartData() {
        return this._data;
    }

    connectedCallback() {
        this._resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this._resizeHandler);
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._resizeHandler);
    }

    renderedCallback() {
        // Initial render only once or when DOM is empty
        const root = this.template.querySelector('[data-chart-root]');
        if (root && root.childNodes.length === 0) {
            this.renderChart();
        }
    }

    handleResize() {
        this.renderChart();
    }

    handleKeyNav(event) {
        // Basic keyboard nav hint: left/right scroll container if overflow
        const wrapper = event.currentTarget;
        if (event.key === 'ArrowRight') {
            wrapper.scrollLeft += 40;
        } else if (event.key === 'ArrowLeft') {
            wrapper.scrollLeft -= 40;
        }
    }

    renderChart() {
        const root = this.template.querySelector('[data-chart-root]');
        if (!root) return;

        // Clear previous
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

        const records = (this._data?.consumption_records_daily || []).slice();

        if (!records.length) {
            const empty = document.createElement('div');
            empty.className = 'slds-text-color_weak';
            empty.textContent = 'No data to display';
            root.appendChild(empty);
            return;
        }

        // Parse and prepare data
        const dates = records.map(r => new Date(r.date));
        const values = records.map(r => Number(r.consumption_kWh));
        const minDate = dates[0];
        const maxDate = dates[dates.length - 1];
        const maxVal = Math.max(...values, 0);

        // Layout
        const width = root.clientWidth || 800;
        const height = 320;
        const margin = { top: 16, right: 12, bottom: 64, left: 48 };
        const innerW = Math.max(200, width - margin.left - margin.right);
        const innerH = Math.max(120, height - margin.top - margin.bottom);

        // Scales
        const xCount = records.length;
        const barGap = 4; // px
        const barWidth = Math.max(4, Math.floor(innerW / xCount) - barGap);
        const chartW = barWidth * xCount + barGap * (xCount - 1);
        const xOffset = margin.left + Math.max(0, (innerW - chartW) / 2);

        const yScale = val => {
            if (maxVal === 0) return innerH;
            return innerH - Math.round((val / maxVal) * innerH);
        };

        // Axis ticks for Y (0, 25%, 50%, 75%, 100%)
        const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * maxVal * 100) / 100);

        // SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Bar chart of daily electricity consumption in kWh');

        // Background
        const bg = document.createElementNS(svg.namespaceURI, 'rect');
        bg.setAttribute('x', '0');
        bg.setAttribute('y', '0');
        bg.setAttribute('width', String(width));
        bg.setAttribute('height', String(height));
        bg.setAttribute('fill', 'var(--lwc-colorBackgroundAlt, #fff)');
        svg.appendChild(bg);

        // Group for chart area
        const g = document.createElementNS(svg.namespaceURI, 'g');
        g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(g);

        // Y grid + axis labels
        yTicks.forEach(t => {
            const y = yScale(t);
            const line = document.createElementNS(svg.namespaceURI, 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('x2', String(innerW));
            line.setAttribute('y1', String(y));
            line.setAttribute('y2', String(y));
            line.setAttribute('stroke', 'var(--lwc-colorBorder, #E5E5E5)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', t === 0 || t === maxVal ? '1' : '0.6');
            g.appendChild(line);

            const label = document.createElementNS(svg.namespaceURI, 'text');
            label.setAttribute('x', '-8');
            label.setAttribute('y', String(y + 4));
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('class', 'axis-text');
            label.textContent = `${t}`;
            g.appendChild(label);
        });

        // Bars
        const barsGroup = document.createElementNS(svg.namespaceURI, 'g');
        g.appendChild(barsGroup);

        records.forEach((r, i) => {
            const x = i * (barWidth + barGap) + Math.max(0, (innerW - chartW) / 2);
            const barTop = yScale(r.consumption_kWh);
            const barHeight = innerH - barTop;

            const bar = document.createElementNS(svg.namespaceURI, 'rect');
            bar.setAttribute('x', String(x));
            bar.setAttribute('y', String(barTop));
            bar.setAttribute('width', String(barWidth));
            bar.setAttribute('height', String(barHeight));
            bar.setAttribute('rx', '2');
            bar.setAttribute('fill', 'var(--chart-bar-color, #4B9EEA)');
            bar.setAttribute('tabindex', '0');
            bar.setAttribute(
                'aria-label',
                `On ${r.date}, consumption ${r.consumption_kWh} kilowatt hours`
            );

            // Tooltip on hover/focus
            bar.addEventListener('mouseenter', () => this.showTooltip(svg, x + barWidth / 2, barTop - 8, r));
            bar.addEventListener('mouseleave', () => this.hideTooltip(svg));
            bar.addEventListener('focus', () => this.showTooltip(svg, x + barWidth / 2, barTop - 8, r));
            bar.addEventListener('blur', () => this.hideTooltip(svg));

            barsGroup.appendChild(bar);

            // X axis tick labels (rotate for readability)
            const xt = document.createElementNS(svg.namespaceURI, 'text');
            xt.setAttribute('x', String(x + barWidth / 2));
            xt.setAttribute('y', String(innerH + 16));
            xt.setAttribute('text-anchor', 'end');
            xt.setAttribute('transform', `rotate(-45, ${x + barWidth / 2}, ${innerH + 16})`);
            xt.setAttribute('class', 'axis-text');
            xt.textContent = this.formatDate(r.date);
            g.appendChild(xt);
        });

        // Y axis title
        const yTitle = document.createElementNS(svg.namespaceURI, 'text');
        yTitle.setAttribute('x', String(-innerH / 2));
        yTitle.setAttribute('y', String(-margin.left + 12));
        yTitle.setAttribute('transform', 'rotate(-90)');
        yTitle.setAttribute('text-anchor', 'middle');
        yTitle.setAttribute('class', 'axis-title');
        yTitle.textContent = `Consumption (${this._data?.metadata?.unit_of_measurement || 'kWh'})`;
        g.appendChild(yTitle);

        // Append svg
        root.appendChild(svg);
    }

    formatDate(iso) {
        try {
            const d = new Date(iso);
            // Return like 23 Nov
            return d.toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short'
            });
        } catch (e) {
            return iso;
        }
    }

    showTooltip(svg, cx, cy, record) {
        this.hideTooltip(svg);

        const ns = svg.namespaceURI;
        const group = document.createElementNS(ns, 'g');
        group.setAttribute('data-tooltip', 'true');

        const text = `${this.formatDate(record.date)} • ${record.consumption_kWh} kWh • ₹${record.cost_inr}`;
        // Measure text by creating temp text
        const t = document.createElementNS(ns, 'text');
        t.setAttribute('x', String(cx + 8));
        t.setAttribute('y', String(Math.max(16, cy)));
        t.setAttribute('class', 'tooltip-text');
        t.textContent = text;
        svg.appendChild(t);
        const bbox = t.getBBox();
        svg.removeChild(t);

        const padding = 6;
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', String(bbox.x - padding));
        rect.setAttribute('y', String(bbox.y - padding));
        rect.setAttribute('width', String(bbox.width + padding * 2));
        rect.setAttribute('height', String(bbox.height + padding * 2));
        rect.setAttribute('rx', '4');
        rect.setAttribute('fill', 'var(--lwc-colorBackgroundInverse, #16325C)');
        rect.setAttribute('opacity', '0.95');

        const textNode = document.createElementNS(ns, 'text');
        textNode.setAttribute('x', String(cx + 8));
        textNode.setAttribute('y', String(Math.max(16, cy)));
        textNode.setAttribute('class', 'tooltip-text');
        textNode.textContent = text;

        group.appendChild(rect);
        group.appendChild(textNode);
        svg.appendChild(group);
    }

    hideTooltip(svg) {
        const existing = svg.querySelector('[data-tooltip="true"]');
        if (existing) {
            existing.remove();
        }
    }
}
