import React, { useEffect, useId, useRef } from 'react';
import * as d3 from 'd3';
import { useAppStore } from '../stores/useAppStore';
import { useResizeObserver } from '../hooks/useResizeObserver';

interface PrHistogramProps {
  width?: number;
  height?: number;
  repoKey?: string | null;
}

const PrHistogram: React.FC<PrHistogramProps> = ({ width = 800, height = 400, repoKey }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: containerRef, size } = useResizeObserver<HTMLDivElement>();
  const tooltipId = useId();
  const { selectedRepo, repoData } = useAppStore();
  
  const activeRepo = repoKey ?? selectedRepo;
  const data = activeRepo ? repoData[activeRepo]?.prTimeToMerge || [] : [];
  const chartWidth = size.width > 0 ? size.width : width;
  const chartHeight =
    size.width > 0 ? Math.max(280, Math.min(520, Math.round(chartWidth * 0.55))) : height;
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 50, left: 55 };

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    // Create group element for the chart
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Extract time to merge values
    const values = data.map(d => d.timeToMerge);

    // Create histogram bins
    const histogramGenerator = d3.histogram()
      .value((d: number) => d)
      .domain(d3.extent(values) as [number, number])
      .thresholds(20); // 20 bins

    const bins = histogramGenerator(values);

    // X scale for time to merge
    const xScale = d3.scaleLinear()
      .domain(d3.extent(values) as [number, number])
      .range([0, innerWidth]);

    // Y scale for frequency
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([innerHeight, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d} hrs`));

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style('text-anchor', 'middle')
      .text('Time to Merge (hours)');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Frequency');

    // Create bar groups
    const barGroups = g.selectAll('.bar-group')
      .data(bins)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    // Add bars
    barGroups.append('rect')
      .attr('x', d => xScale(d.x0!) + 1)
      .attr('y', d => yScale(d.length))
      .attr('width', d => Math.max(0, xScale(d.x1!) - xScale(d.x0!) - 1))
      .attr('height', d => innerHeight - yScale(d.length))
      .attr('fill', '#69b3a2');

    // Calculate median
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    
    // Add median line
    g.append('line')
      .attr('x1', xScale(median))
      .attr('x2', xScale(median))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    // Add median label
    g.append('text')
      .attr('x', xScale(median) + 5)
      .attr('y', 20)
      .attr('fill', '#e74c3c')
      .text(`Median: ${median.toFixed(1)} hrs`)
      .attr('font-weight', 'bold');

    // Add tooltip
    d3.select('body').selectAll(`div[data-tooltip-id='${tooltipId}']`).remove();
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .attr('data-tooltip-id', tooltipId)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('opacity', 0);

    // Add mouseover events to bars
    barGroups
      .on('mouseover', function(_event, d) {
        tooltip.style('opacity', 1);
        tooltip.html(`
          <div><strong>Time Range:</strong> ${d.x0!.toFixed(1)} - ${d.x1!.toFixed(1)} hrs</div>
          <div><strong>Frequency:</strong> ${d.length}</div>
          <div><strong>PRs in Range:</strong> ${d.map((_binValue, _idx) => {
            const pr = data.find(pr => pr.timeToMerge >= d.x0! && pr.timeToMerge < d.x1!);
            return pr ? `${pr.title.substring(0, 30)}${pr.title.length > 30 ? '...' : ''}` : '';
          }).filter(Boolean).join(', ')}
        `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });

    return () => {
      d3.select('body').selectAll(`div[data-tooltip-id='${tooltipId}']`).remove();
    };
  }, [data, chartWidth, chartHeight, tooltipId]);

  return (
    <div ref={containerRef} className="min-h-[320px] w-full">
      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
          No PR data available. Select a repository to analyze.
        </div>
      ) : (
        <svg ref={svgRef} className="h-auto w-full" />
      )}
    </div>
  );
};

export default PrHistogram;
