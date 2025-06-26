// visualizer.js

// Import Core Functions

// Import Data Processing Function
import { prepareData } from './data_processor.js'

// Import Chart Function

// Import 1D chart functions (double and strings)
import {create1DLineChart, createCategoryChart } from '../charts/1dim/line_chart.js';
// Import 2D chart functions (double)
import {createSizeChart, createColorChart, createScatterChart } from '../charts/2dim/2dimchart_double.js';
// Import 2D chart functions (string)
import { createBarSizeChart, createBarColorChart, createBarChart } from '../charts/2dim/2dimchart_string.js';
// Import 3D chart functions (double)
import { createSizeColorChart, createScatterSizeChart, createScatterColorChart } from '../charts/3dim/3dimchart_double.js';
// Import 3D chart functions (string)
import { createGroupedBarSizeChart, createGroupedBarChart, createGroupedBarColorChart } from '../charts/3dim/3dimchart_string.js';
// Import 4D chart function (double)
import { createScatterSizeColorChart } from '../charts/4dim/4dimchart_double.js';
// Import 4D chart function (string)
import { createGroupedScatterSizeColorChart } from '../charts/4dim/4dimchart_string.js';

export function createVisualization(dataset, vizType, originalData, filterConfig = {}, scalingConfig = {}, colorScalingConfig = {}) {
  const data = prepareData(dataset, originalData, filterConfig);
  
  switch (vizType.type) {
    // 1D 시각화
    case 'line1d':
      return create1DLineChart(data, dataset);
    case 'category':
      return createCategoryChart(data, dataset);
      
    // 2D 시각화
    case 'size':
      return createSizeChart(data, dataset, scalingConfig);
    case 'color':
      return createColorChart(data, dataset, colorScalingConfig);
    case 'scatter':
      return createScatterChart(data, dataset);
      
    // 2D String 시각화
    case 'bar_size':
      return createBarSizeChart(data, dataset, scalingConfig);  // ADDED scalingConfig
    case 'bar_color':
      return createBarColorChart(data, dataset, colorScalingConfig);
    case 'bar':
      return createBarChart(data, dataset);
      
    // 3D 시각화
    case 'size_color':
      return createSizeColorChart(data, dataset, scalingConfig, colorScalingConfig);
    case 'scatter_size':
      return createScatterSizeChart(data, dataset, scalingConfig);
    case 'scatter_color':
      return createScatterColorChart(data, dataset, colorScalingConfig);
      
    // 3D String 시각화
    case 'grouped_bar_size':
      return createGroupedBarSizeChart(data, dataset, scalingConfig);  // ADDED scalingConfig
    case 'grouped_bar':
      return createGroupedBarChart(data, dataset);
    case 'grouped_bar_color':
      return createGroupedBarColorChart(data, dataset, colorScalingConfig);
      
    // 4D 시각화
    case 'scatter_size_color':
      return createScatterSizeColorChart(data, dataset, scalingConfig, colorScalingConfig);  // ADDED scalingConfig
      
    // 4D String 시각화
    case 'grouped_scatter_size_color':
      return createGroupedScatterSizeColorChart(data, dataset, scalingConfig, colorScalingConfig);  // ADDED scalingConfig
      
    default:
      throw new Error(`Unknown visualization type: ${vizType.type}`);
  }
}