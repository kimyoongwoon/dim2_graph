// Import necessary functions
import { formatFullData, findAxisByName, getUsedAxesForVisualization } from '../../graph_UI/utils/DataUtils.js';
import { getActiveVisualizationType } from '../../graph_UI/charts/ChartManager.js';
import { datasets, originalData, filters, windowState } from '../../graph_complete.js';

// Filters and Transforms raw data for Visualization
// Applies both filters and window constraints to Data

export function prepareData(dataset, originalData, filterConfig) {
  if (!originalData || !originalData.data_value) {
    return [];
  }
  
  // 축 인덱스 매핑
  const axisIndices = dataset.axes.map(axis => {
    if (axis.type === 'input') {
      return { type: 'input', index: axis.index };
    } else if (axis.type === 'output') {
      return { type: 'output', index: axis.index };
    } else if (axis.type === 'string') {
      return { type: 'string', index: -1 };
    }
  });
  
  // 데이터 추출 및 필터링
  const preparedData = originalData.data_value
    .map((point, dataIndex) => {
      const coords = point[0];
      const value = point[1];
      
      const result = {
        _originalIndex: dataIndex,
        _coords: coords,
        _value: value
      };
      
      // 사용된 축의 데이터 추출
      axisIndices.forEach((axisInfo, i) => {
        const axis = dataset.axes[i];
        
        if (axisInfo.type === 'input') {
          result[axis.name] = coords[axisInfo.index];
        } else if (axisInfo.type === 'output') {
          if (Array.isArray(value)) {
            if (typeof value[0] === 'string') {
              // string_double or string_array
              result[axis.name] = value[1][axisInfo.index];
            } else {
              // array
              result[axis.name] = value[axisInfo.index];
            }
          } else {
            // double
            result[axis.name] = value;
          }
        } else if (axisInfo.type === 'string') {
          result[axis.name] = value[0]; // string value
        }
      });
      
      // 전체 데이터 포맷팅
      result._fullData = formatFullData(coords, value);
      
      return result;
    })
    .filter(data => {
      // 필터 적용
      for (const axisName in filterConfig) {
        const filter = filterConfig[axisName];
        if (!filter || filter.mode === '모두') continue;
        
        // 해당 축의 값 가져오기
        let axisValue;
        const axis = findAxisByName(axisName, originalData);
        
        if (axis.type === 'input') {
          axisValue = data._coords[axis.index];
        } else if (axis.type === 'output') {
          const val = data._value;
          if (Array.isArray(val)) {
            if (typeof val[0] === 'string') {
              axisValue = val[1][axis.index];
            } else {
              axisValue = val[axis.index];
            }
          } else {
            axisValue = val;
          }
        }
        
        // 필터 조건 확인
        if (filter.mode === '>=') {
          if (axisValue < filter.value) return false;
        } else if (filter.mode === '=') {
          if (Math.abs(axisValue - filter.value) > 0.0001) return false;
        } else if (filter.mode === '<=') {
          if (axisValue > filter.value) return false;
        }
      }
      
      return true;
    });
  
  return preparedData;
}

export function getFilteredDataWithWindow(datasetIndex, customAxisStates = null) {
  const dataset = datasets[datasetIndex];
  if (!originalData || !originalData.data_value) {
    return [];
  }
  
  // 기존 필터 적용
  const filterConfig = filters[datasetIndex] || {};
  let filteredData = prepareData(dataset, originalData, filterConfig);
  
  // 윈도우 상태가 없으면 필터만 적용된 데이터 반환
  if (!windowState[datasetIndex] || !windowState[datasetIndex].axes) {
    return filteredData;
  }
  
  // 현재 시각화 타입 가져오기
  const vizType = getActiveVisualizationType(datasetIndex);
  const usedAxes = getUsedAxesForVisualization(dataset, vizType);
  
  // 윈도우 필터 적용 (사용되는 축에 대해서만)
  const axisStates = customAxisStates || windowState[datasetIndex].axes;
  
  filteredData = filteredData.filter(dataPoint => {
    for (const axis of usedAxes) {
      if (axisStates[axis.name]) {
        const axisState = axisStates[axis.name];
        const value = dataPoint[axis.name];
        
        if (value < axisState.startValue || value >= axisState.endValue) {
          return false;
        }
      }
    }
    return true;
  });
  
  return filteredData;
}