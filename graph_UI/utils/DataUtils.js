// Import necessary functions
import { originalData, VISUALIZATION_AXIS_MAP } from '../../graph_complete.js';

// Calculates min/max values for axes
// Locates axis information in data structure
// Formats data for display purposes
// Determines which axes are used by a specific visualization type
// Locates original axis information from the base data structure

export function getAxisRange(axis) {
  if (!originalData || !originalData.data_value) {
    return { min: 0, max: 100 };
  }
  
  const values = originalData.data_value.map(point => {
    const coords = point[0];
    const value = point[1];
    
    if (axis.type === 'input') {
      return coords[axis.index];
    } else if (axis.type === 'output') {
      if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          return value[1][axis.index];
        } else {
          return value[axis.index];
        }
      } else {
        return value;
      }
    }
  }).filter(v => v !== undefined && !isNaN(v));
  
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

export function findAxisByName(name, originalData) {
  // 입력 축 확인
  const inputAxes = originalData.basic_data.axes;
  for (let i = 0; i < inputAxes.length; i++) {
    if (inputAxes[i].name === name) {
      return { type: 'input', index: i };
    }
  }
  
  // 출력 축 확인
  const firstData = originalData.data_value[0];
  if (!firstData) return null;
  
  const value = firstData[1];
  if (name === 'String') {
    return { type: 'string', index: -1 };
  }
  
  // Y0, Y1, ... 형태 확인
  const match = name.match(/^Y(\d+)$/);
  if (match) {
    return { type: 'output', index: parseInt(match[1]) };
  }
  
  return null;
}

export function formatFullData(coords, value) {
  let result = `입력: [${coords.join(', ')}]\n`;
  
  if (Array.isArray(value)) {
    if (typeof value[0] === 'string') {
      result += `출력: "${value[0]}", [${value[1].join(', ')}]`;
    } else {
      result += `출력: [${value.join(', ')}]`;
    }
  } else {
    result += `출력: ${value}`;
  }
  
  return result;
}

export function getUsedAxesForVisualization(dataset, vizType) {
  const axisRoles = VISUALIZATION_AXIS_MAP[vizType.type] || [];
  const usedAxes = [];
  
  // String 축은 윈도우 대상에서 제외
  if (axisRoles.includes('x') && dataset.axes[0] && dataset.axes[0].type !== 'string') {
    usedAxes.push(dataset.axes[0]);
  }
  if (axisRoles.includes('y') && dataset.axes[1] && dataset.axes[1].type !== 'string') {
    usedAxes.push(dataset.axes[1]);
  }
  
  return usedAxes;
}

export function findOriginalAxisInfo(axisName) {
  if (!originalData || !originalData.basic_data || !originalData.basic_data.axes) {
    return null;
  }
  
  return originalData.basic_data.axes.find(axis => axis.name === axisName);
}