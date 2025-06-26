// Import necessary functions
import { createFilterSection } from './FilterSection.js';
import { createWindowSection } from './WindowSection.js';
import { updateWindowDisplay } from '../utils/DOMUtils.js';
import { switchVisualization, createChart } from '../charts/ChartManager.js';
import { windowState } from '../../graph_complete.js';
import { createScalingSection } from '../../visualizations/scaling/size_scaling.js';
import { createColorScalingSection } from '../../visualizations/scaling/color_scaling.js';
import { updateWindowControls } from '../state/WindowManager.js';


// Main Container for each dataset with header and content areas

export function createDatasetCard(dataset, index, allAxes) {
  const card = document.createElement('div');
  card.className = 'dataset-card';
  card.id = `dataset-${index}`;
  
  // 제목
  const title = document.createElement('h3');
  title.textContent = dataset.name;
  card.appendChild(title);
  
  // 시각화 타입 버튼들
  const vizButtons = document.createElement('div');
  vizButtons.className = 'viz-buttons';
  
  dataset.visualizationTypes.forEach((vizType, vizIndex) => {
    const button = document.createElement('button');
    button.className = 'viz-button';
    if (vizIndex === 0) button.classList.add('active');
    button.textContent = vizType.name;
    button.onclick = () => switchVisualization(index, vizIndex);
    vizButtons.appendChild(button);
  });
  
  card.appendChild(vizButtons);
  
  // 필터 섹션
  const filterSection = createFilterSection(dataset, index, allAxes);
  card.appendChild(filterSection);
  
  // 윈도우 컨트롤 섹션
  const windowSection = createWindowSection(dataset, index);
  card.appendChild(windowSection);
  
  // Size Scaling Section
  const scalingSection = createScalingSection(dataset, index, (datasetIndex, scalingConfig) => {
  // Import the necessary functions at the top
  import('../../graph_complete.js').then(module => {
    module.scalingConfigs[datasetIndex] = scalingConfig;
    // Trigger chart update
    import('../charts/ChartManager.js').then(chartModule => {
      const card = document.getElementById(`dataset-${datasetIndex}`);
const buttons = card.querySelectorAll('.viz-button');
const activeButton = card.querySelector('.viz-button.active');
const currentVizIndex = Array.from(buttons).indexOf(activeButton);
      chartModule.createChart(datasetIndex, parseInt(currentVizIndex));
    });
  });
});

if (scalingSection) {
  card.appendChild(scalingSection);
}

// Color Scaling Section
const colorScalingSection = createColorScalingSection(dataset, index, (datasetIndex, colorScalingConfig) => {
  import('../../graph_complete.js').then(module => {
    module.colorScalingConfigs[datasetIndex] = colorScalingConfig;
    import('../charts/ChartManager.js').then(chartModule => {
      const card = document.getElementById(`dataset-${datasetIndex}`);
      const buttons = card.querySelectorAll('.viz-button');
      const activeButton = card.querySelector('.viz-button.active');
      const currentVizIndex = Array.from(buttons).indexOf(activeButton);
      chartModule.createChart(datasetIndex, currentVizIndex);
    });
  });
});

if (colorScalingSection) {
  card.appendChild(colorScalingSection);
}

  // 차트 컨테이너
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  const canvas = document.createElement('canvas');
  canvas.id = `chart-${index}`;
  chartContainer.appendChild(canvas);
  card.appendChild(chartContainer);
  
  // 데이터셋 정보
  const info = document.createElement('div');
  info.className = 'dataset-info';
  info.innerHTML = `
    <strong>축 구성:</strong> ${dataset.axes.map(a => a.name).join(', ')}<br>
    <strong>데이터 타입:</strong> ${dataset.dataType}
  `;
  card.appendChild(info);
  
  // 초기 시각화 생성
  setTimeout(() => {
    createChart(index, 0);
    
    updateWindowControls(index, dataset.visualizationTypes[0]);

    // 윈도우 정보 업데이트 (윈도우 상태가 있는 경우에만)
    if (windowState[index] && windowState[index].axes) {
      Object.keys(windowState[index].axes).forEach(axisName => {
        updateWindowDisplay(index, axisName);
      });
    }
  }, 200);
  
  return card;
}