export class Charts {
    static createPriorityPieChart(data: { [key: string]: number }, container: HTMLElement) {
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        let cumulativePercentage = 0;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '-1 -1 2 2');
        svg.setAttribute('style', 'transform: rotate(-90deg)');

        const colors = {
            high: 'var(--danger)',
            medium: 'var(--warning)',
            low: 'var(--info)'
        };

        Object.entries(data).forEach(([priority, value]) => {
            const percentage = value / total;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Calculate the SVG arc path
            const startAngle = cumulativePercentage * Math.PI * 2;
            const endAngle = (cumulativePercentage + percentage) * Math.PI * 2;

            const x1 = Math.cos(startAngle);
            const y1 = Math.sin(startAngle);
            const x2 = Math.cos(endAngle);
            const y2 = Math.sin(endAngle);

            const largeArc = percentage > 0.5 ? 1 : 0;

            const d = `M ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} L 0 0`;

            path.setAttribute('d', d);
            path.setAttribute('fill', colors[priority as keyof typeof colors]);

            svg.appendChild(path);
            cumulativePercentage += percentage;
        });

        container.appendChild(svg);

        // Add legend
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        Object.entries(data).forEach(([priority, value]) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
        <span class="legend-color" style="background-color: ${colors[priority as keyof typeof colors]}"></span>
        <span class="legend-label">${priority} (${value})</span>
      `;
            legend.appendChild(item);
        });
        container.appendChild(legend);
    }

    static createBarChart(data: { label: string; value: number }[], container: HTMLElement) {
        const maxValue = Math.max(...data.map(item => item.value));
        const chart = document.createElement('div');
        chart.className = 'bar-chart';

        data.forEach(item => {
            const percentage = (item.value / maxValue) * 100;
            const bar = document.createElement('div');
            bar.className = 'bar-item';
            bar.innerHTML = `
        <div class="bar-label">${item.label}</div>
        <div class="bar">
          <div class="bar-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="bar-value">${item.value}</div>
      `;
            chart.appendChild(bar);
        });

        container.appendChild(chart);
    }

    static createProgressRing(percentage: number, container: HTMLElement) {
        const ring = document.createElement('div');
        ring.className = 'progress-ring';

        const circumference = 2 * Math.PI * 15.9155; // Radius of 15.9155 from our SVG
        const offset = circumference - (percentage / 100) * circumference;

        ring.innerHTML = `
      <svg viewBox="0 0 36 36">
        <path d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="var(--bg-dark-secondary)"
          stroke-width="3"
        />
        <path d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="var(--primary)"
          stroke-width="3"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
        />
      </svg>
      <div class="percentage">${percentage}%</div>
    `;

        container.appendChild(ring);
    }
}