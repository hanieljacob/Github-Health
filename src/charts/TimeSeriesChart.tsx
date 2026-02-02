import React, { useEffect, useId, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useAppStore } from '../stores/useAppStore';
import { useResizeObserver } from '../hooks/useResizeObserver';
import type { TimeSeriesPoint } from '../types';

interface TimeSeriesChartProps {
  width?: number;
  height?: number;
  repoKey?: string | null;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ width = 800, height = 400, repoKey }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: containerRef, size } = useResizeObserver<HTMLDivElement>();
  const tooltipId = useId();
  const { selectedRepo, repoData } = useAppStore();
  const [activeMetrics, setActiveMetrics] = useState({
    issuesOpened: true,
    issuesClosed: true,
    prsOpened: false,
    prsMerged: false,
    commits: false,
  });
  
  const activeRepo = repoKey ?? selectedRepo;
  const data = activeRepo ? repoData[activeRepo]?.timeSeriesData || [] : [];
  const chartWidth = size.width > 0 ? size.width : width;
  const chartHeight =
    size.width > 0 ? Math.max(280, Math.min(520, Math.round(chartWidth * 0.55))) : height;
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = {
      top: 20,
      right: chartWidth < 560 ? 30 : 100,
      bottom: 50,
      left: 55,
    };

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

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => {
        let max = 0;
        if (activeMetrics.issuesOpened) max = Math.max(max, d.issuesOpened);
        if (activeMetrics.issuesClosed) max = Math.max(max, d.issuesClosed);
        if (activeMetrics.prsOpened) max = Math.max(max, d.prsOpened);
        if (activeMetrics.prsMerged) max = Math.max(max, d.prsMerged);
        if (activeMetrics.commits) max = Math.max(max, d.commits);
        return max;
      }) || 0])
      .range([innerHeight, 0]);

    // Create line generators
    const line = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(activeMetrics.issuesOpened ? d.issuesOpened : 0))
      .defined(d => activeMetrics.issuesOpened && d.issuesOpened > 0);

    const lineClosed = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(activeMetrics.issuesClosed ? d.issuesClosed : 0))
      .defined(d => activeMetrics.issuesClosed && d.issuesClosed > 0);

    const linePrsOpened = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(activeMetrics.prsOpened ? d.prsOpened : 0))
      .defined(d => activeMetrics.prsOpened && d.prsOpened > 0);

    const linePrsMerged = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(activeMetrics.prsMerged ? d.prsMerged : 0))
      .defined(d => activeMetrics.prsMerged && d.prsMerged > 0);

    const lineCommits = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(activeMetrics.commits ? d.commits : 0))
      .defined(d => activeMetrics.commits && d.commits > 0);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d') as (domainValue: Date | d3.NumberValue, index: number) => string));

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .style('text-anchor', 'middle')
      .text('Date');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Count');

    // Draw lines
    if (activeMetrics.issuesOpened) {
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2)
        .attr('d', line);
    }

    if (activeMetrics.issuesClosed) {
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#ff7f0e')
        .attr('stroke-width', 2)
        .attr('d', lineClosed);
    }

    if (activeMetrics.prsOpened) {
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#2ca02c')
        .attr('stroke-width', 2)
        .attr('d', linePrsOpened);
    }

    if (activeMetrics.prsMerged) {
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#d62728')
        .attr('stroke-width', 2)
        .attr('d', linePrsMerged);
    }

    if (activeMetrics.commits) {
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#9467bd')
        .attr('stroke-width', 2)
        .attr('d', lineCommits);
    }

    // Add legend
    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('text-anchor', 'start');

    const legendItems: Array<{
      key: keyof typeof activeMetrics;
      label: string;
      color: string;
      active: boolean;
    }> = [
      { key: 'issuesOpened', label: 'Issues Opened', color: '#1f77b4', active: activeMetrics.issuesOpened },
      { key: 'issuesClosed', label: 'Issues Closed', color: '#ff7f0e', active: activeMetrics.issuesClosed },
      { key: 'prsOpened', label: 'PRs Opened', color: '#2ca02c', active: activeMetrics.prsOpened },
      { key: 'prsMerged', label: 'PRs Merged', color: '#d62728', active: activeMetrics.prsMerged },
      { key: 'commits', label: 'Commits', color: '#9467bd', active: activeMetrics.commits },
    ];

    legend.selectAll('rect')
      .data(legendItems)
      .enter()
      .append('rect')
      .attr('x', innerWidth + 10)
      .attr('y', (_d, i) => i * 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color)
      .attr('opacity', d => d.active ? 1 : 0.3);

    legend.selectAll('text')
      .data(legendItems)
      .enter()
      .append('text')
      .attr('x', innerWidth + 28)
      .attr('y', (_d, i) => i * 20 + 9)
      .text(d => d.label)
      .attr('opacity', d => d.active ? 1 : 0.3)
      .on('click', (_event, d) => {
        setActiveMetrics(prev => ({
          ...prev,
          [d.key]: !prev[d.key]
        }));
      })
      .style('cursor', 'pointer');

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

    // Add mouseover events
    const mouseover = (_event: MouseEvent, d: TimeSeriesPoint) => {
      tooltip.style('opacity', 1);
      tooltip.html(`
        <div><strong>${d.date.toLocaleDateString()}</strong></div>
        ${activeMetrics.issuesOpened ? `<div>Issues Opened: ${d.issuesOpened}</div>` : ''}
        ${activeMetrics.issuesClosed ? `<div>Issues Closed: ${d.issuesClosed}</div>` : ''}
        ${activeMetrics.prsOpened ? `<div>PRs Opened: ${d.prsOpened}</div>` : ''}
        ${activeMetrics.prsMerged ? `<div>PRs Merged: ${d.prsMerged}</div>` : ''}
        ${activeMetrics.commits ? `<div>Commits: ${d.commits}</div>` : ''}
      `);
    };

    const mousemove = (event: MouseEvent, _d: TimeSeriesPoint) => {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    };

    const mouseleave = () => {
      tooltip.style('opacity', 0);
    };

    // Add circles for data points
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => {
        // Position tooltip based on active metric with highest value
        if (activeMetrics.issuesOpened && d.issuesOpened > 0) return yScale(d.issuesOpened);
        if (activeMetrics.issuesClosed && d.issuesClosed > 0) return yScale(d.issuesClosed);
        if (activeMetrics.prsOpened && d.prsOpened > 0) return yScale(d.prsOpened);
        if (activeMetrics.prsMerged && d.prsMerged > 0) return yScale(d.prsMerged);
        if (activeMetrics.commits && d.commits > 0) return yScale(d.commits);
        return yScale(0);
      })
      .attr('r', 3)
      .attr('fill', '#000')
      .style('opacity', 0)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    return () => {
      d3.select('body').selectAll(`div[data-tooltip-id='${tooltipId}']`).remove();
    };
  }, [data, chartWidth, chartHeight, activeMetrics, tooltipId]);

  return (
    <div ref={containerRef} className="min-h-[320px] w-full">
      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
          No data available. Select a repository to analyze.
        </div>
      ) : (
        <svg ref={svgRef} className="h-auto w-full" />
      )}
    </div>
  );
};

export default TimeSeriesChart;
