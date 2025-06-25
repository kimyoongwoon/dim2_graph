// visualizer.js

export function createVisualization(dataset, vizType, originalData, filterConfig = {}) {
  const data = prepareData(dataset, originalData, filterConfig);
  
  switch (vizType.type) {
    // 1D 시각화
    case 'line1d':
      return create1DLineChart(data, dataset);
    case 'category':
      return createCategoryChart(data, dataset);
      
    // 2D 시각화
    case 'size':
      return createSizeChart(data, dataset);
    case 'color':
      return createColorChart(data, dataset);
    case 'scatter':
      return createScatterChart(data, dataset);
      
    // 2D String 시각화
    case 'bar_size':
      return createBarSizeChart(data, dataset);
    case 'bar_color':
      return createBarColorChart(data, dataset);
    case 'bar':
      return createBarChart(data, dataset);
      
    // 3D 시각화
    case 'size_color':
      return createSizeColorChart(data, dataset);
    case 'scatter_size':
      return createScatterSizeChart(data, dataset);
    case 'scatter_color':
      return createScatterColorChart(data, dataset);
      
    // 3D String 시각화
    case 'grouped_bar_size':
      return createGroupedBarSizeChart(data, dataset);
    case 'grouped_bar':
      return createGroupedBarChart(data, dataset);
    case 'grouped_bar_color':
      return createGroupedBarColorChart(data, dataset);
      
    // 4D 시각화
    case 'scatter_size_color':
      return createScatterSizeColorChart(data, dataset);
      
    // 4D String 시각화
    case 'grouped_scatter_size_color':
      return createGroupedScatterSizeColorChart(data, dataset);
      
    default:
      throw new Error(`Unknown visualization type: ${vizType.type}`);
  }
}

function prepareData(dataset, originalData, filterConfig) {
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

function findAxisByName(name, originalData) {
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

function formatFullData(coords, value) {
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

// 1D 시각화
function create1DLineChart(data, dataset) {
  const axisName = dataset.axes[0].name;
  const values = data.map(d => d[axisName]).sort((a, b) => a - b);
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: axisName,
        data: data.map((d, i) => ({ 
          x: d[axisName], 
          y: 0,
          fullData: d._fullData
        })),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: axisName }
        },
        y: {
          display: false,
          min: -0.5,
          max: 0.5
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${axisName}: ${ctx.parsed.x}`,
            afterLabel: (ctx) => '\n' + ctx.raw.fullData
          }
        }
      }
    }
  };
}

function createCategoryChart(data, dataset) {
  const categories = [...new Set(data.map(d => d[dataset.axes[0].name]))];
  const counts = {};
  const categoryData = {};
  
  categories.forEach(cat => {
    counts[cat] = 0;
    categoryData[cat] = [];
  });
  
  data.forEach(d => {
    const cat = d[dataset.axes[0].name];
    counts[cat]++;
    categoryData[cat].push(d);
  });
  
  return {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{
        label: '개수',
        data: categories.map(cat => counts[cat]),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: '개수' }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `개수: ${ctx.parsed.y}`,
            afterLabel: (ctx) => {
              const cat = categories[ctx.dataIndex];
              const catData = categoryData[cat];
              if (catData.length > 0) {
                return `\n첫 번째 데이터:\n${catData[0]._fullData}`;
              }
              return '';
            }
          }
        }
      }
    }
  };
}

// 2D 시각화
function createSizeChart(data, dataset) {
  const xAxis = dataset.axes[0].name;
  const sizeAxis = dataset.axes[1].name;
  
  // Check for empty data FIRST, before any processing
  if (!data || data.length === 0) {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${xAxis} (크기: ${sizeAxis})`,
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointRadius: 5 // default size
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: xAxis } },
          y: { display: false, min: -0.5, max: 0.5 }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => [`${xAxis}: ${ctx.parsed.x}`, `${sizeAxis}: ${ctx.raw.size}`],
              afterLabel: (ctx) => '\n' + ctx.raw.fullData
            }
          }
        }
      }
    };
  }
  
  // Only process data if we have data
  const sizeValues = data.map(d => d[sizeAxis]);
  const minSize = Math.min(...sizeValues);
  const maxSize = Math.max(...sizeValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${xAxis} (크기: ${sizeAxis})`,
        data: data.map(d => ({
          x: d[xAxis],
          y: 0,
          size: d[sizeAxis],
          fullData: d._fullData
        })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: (ctx) => {
          // Safety check for empty data
          if (!ctx.raw || ctx.raw.size === undefined || !isFinite(minSize) || !isFinite(maxSize)) {
            return 5; // fallback size
          }
          const size = ctx.raw.size;
          return 3 + (size - minSize) / (maxSize - minSize) * 15;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          display: false,
          min: -0.5,
          max: 0.5
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => [
              `${xAxis}: ${ctx.parsed.x}`,
              `${sizeAxis}: ${ctx.raw.size}`
            ],
            afterLabel: (ctx) => '\n' + ctx.raw.fullData
          }
        }
      }
    }
  };
}

function createColorChart(data, dataset) {
  const xAxis = dataset.axes[0].name;
  const colorAxis = dataset.axes[1].name;
  
  // Check for empty data FIRST, before any processing
  if (!data || data.length === 0) {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${xAxis} (색상: ${colorAxis})`,
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(0, 0, 0, 0.2)',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: xAxis } },
          y: { display: false, min: -0.5, max: 0.5 }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => [`${xAxis}: ${ctx.parsed.x}`, `${colorAxis}: ${ctx.raw.color}`]
            }
          }
        }
      }
    };
  }
  
  // Only process data if we have data
  const colorValues = data.map(d => d[colorAxis]);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${xAxis} (색상: ${colorAxis})`,
        data: data.map(d => ({
          x: d[xAxis],
          y: 0,
          color: d[colorAxis]
        })),
        backgroundColor: (ctx) => {
          const value = ctx.raw.color;
          const normalized = (value - minColor) / (maxColor - minColor);
          const hue = normalized * 240;
          return `hsl(${240 - hue}, 70%, 50%)`;
        },
        borderColor: 'rgba(0, 0, 0, 0.2)',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          display: false,
          min: -0.5,
          max: 0.5
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => [
              `${xAxis}: ${ctx.parsed.x}`,
              `${colorAxis}: ${ctx.raw.color}`
            ]
          }
        }
      }
    }
  };
}

function createScatterChart(data, dataset) {
  const xAxis = dataset.axes[0].name;
  const yAxis = dataset.axes[1].name;
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${xAxis} vs ${yAxis}`,
        data: data.map(d => ({
          x: d[xAxis],
          y: d[yAxis],
          fullData: d._fullData
        })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          title: { display: true, text: yAxis }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => [
              `${xAxis}: ${ctx.parsed.x}`,
              `${yAxis}: ${ctx.parsed.y}`
            ],
            afterLabel: (ctx) => '\n' + ctx.raw.fullData
          }
        }
      }
    }
  };
}

// 2D String 시각화
function createBarChart(data, dataset) {
  const stringAxis = dataset.axes[0].name;
  const valueAxis = dataset.axes[1].name;
  
  const categories = [...new Set(data.map(d => d[stringAxis]))];
  const avgValues = {};
  const categoryData = {};
  
  categories.forEach(cat => {
    const catData = data.filter(d => d[stringAxis] === cat);
    const values = catData.map(d => d[valueAxis]);
    avgValues[cat] = values.reduce((a, b) => a + b, 0) / values.length;
    categoryData[cat] = catData;
  });
  
  return {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{
        label: valueAxis,
        data: categories.map(cat => avgValues[cat]),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: valueAxis }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `평균 ${valueAxis}: ${ctx.parsed.y.toFixed(3)}`,
            afterLabel: (ctx) => {
              const cat = categories[ctx.dataIndex];
              const catData = categoryData[cat];
              return `\n${catData.length}개 데이터의 평균\n첫 번째 데이터:\n${catData[0]._fullData}`;
            }
          }
        }
      }
    }
  };
}

function createBarSizeChart(data, dataset) {
  const stringAxis = dataset.axes[0].name;
  const sizeAxis = dataset.axes[1].name;
  
  const categories = [...new Set(data.map(d => d[stringAxis]))];
  
  return {
    type: 'bubble',
    data: {
      datasets: [{
        label: `${stringAxis} (크기: ${sizeAxis})`,
        data: data.map((d, i) => ({
          x: categories.indexOf(d[stringAxis]),
          y: 0,
          r: Math.sqrt(d[sizeAxis]) * 5
        })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          labels: categories,
          title: { display: true, text: stringAxis }
        },
        y: {
          display: false,
          min: -1,
          max: 1
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const cat = categories[ctx.parsed.x];
              const size = Math.pow(ctx.raw.r / 5, 2);
              return [`${stringAxis}: ${cat}`, `${sizeAxis}: ${size.toFixed(2)}`];
            }
          }
        }
      }
    }
  };
}

function createBarColorChart(data, dataset) {
  const stringAxis = dataset.axes[0].name;
  const colorAxis = dataset.axes[1].name;
  
  const categories = [...new Set(data.map(d => d[stringAxis]))];
  const colorValues = data.map(d => d[colorAxis]);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: data.map((d, i) => ({
        label: d[stringAxis],
        data: [{
          x: categories.indexOf(d[stringAxis]),
          y: 0
        }],
        backgroundColor: (() => {
          const normalized = (d[colorAxis] - minColor) / (maxColor - minColor);
          const hue = normalized * 240;
          return `hsl(${240 - hue}, 70%, 50%)`;
        })(),
        pointRadius: 8,
        showLine: false
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          labels: categories,
          title: { display: true, text: stringAxis }
        },
        y: {
          display: false,
          min: -0.5,
          max: 0.5
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const d = data[ctx.datasetIndex];
              return [`${stringAxis}: ${d[stringAxis]}`, `${colorAxis}: ${d[colorAxis]}`];
            }
          }
        }
      }
    }
  };
}

// 3D 시각화
function createSizeColorChart(data, dataset) {
  const xAxis = dataset.axes[0].name;
  const sizeAxis = dataset.axes[1].name;
  const colorAxis = dataset.axes[2].name;
  
  // Check for empty data FIRST, before any processing
  if (!data || data.length === 0) {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${xAxis} (크기: ${sizeAxis}, 색상: ${colorAxis})`,
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(0, 0, 0, 0.2)',
          pointRadius: 5 // default size
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: xAxis } },
          y: { display: false, min: -0.5, max: 0.5 }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => [
                `${xAxis}: ${ctx.parsed.x}`,
                `${sizeAxis}: ${ctx.raw.size}`,
                `${colorAxis}: ${ctx.raw.color}`
              ]
            }
          }
        }
      }
    };
  }
  
  // Only process data if we have data
  const sizeValues = data.map(d => d[sizeAxis]);
  const minSize = Math.min(...sizeValues);
  const maxSize = Math.max(...sizeValues);
  
  const colorValues = data.map(d => d[colorAxis]);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${xAxis} (크기: ${sizeAxis}, 색상: ${colorAxis})`,
        data: data.map(d => ({
          x: d[xAxis],
          y: 0,
          size: d[sizeAxis],
          color: d[colorAxis]
        })),
        backgroundColor: (ctx) => {
          // Safety check for empty data
          if (!ctx.raw || ctx.raw.color === undefined || !isFinite(minColor) || !isFinite(maxColor)) {
            return 'rgba(54, 162, 235, 0.6)'; // fallback color
          }
          const value = ctx.raw.color;
          const normalized = (value - minColor) / (maxColor - minColor);
          const hue = normalized * 240;
          return `hsl(${240 - hue}, 70%, 50%)`;
        },
        borderColor: 'rgba(0, 0, 0, 0.2)',
        pointRadius: (ctx) => {
          // Safety check for empty data
          if (!ctx.raw || ctx.raw.size === undefined || !isFinite(minSize) || !isFinite(maxSize)) {
            return 5; // fallback size
          }
          const size = ctx.raw.size;
          return 3 + (size - minSize) / (maxSize - minSize) * 15;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          display: false,
          min: -0.5,
          max: 0.5
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => [
              `${xAxis}: ${ctx.parsed.x}`,
              `${sizeAxis}: ${ctx.raw.size}`,
              `${colorAxis}: ${ctx.raw.color}`
            ]
          }
        }
      }
    }
  };
}

function createScatterSizeChart(data, dataset) {
  const xAxis = dataset.axes[0].name;
  const yAxis = dataset.axes[1].name;
  const sizeAxis = dataset.axes[2].name;
  
  // Check for empty data FIRST, before any processing
  if (!data || data.length === 0) {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${xAxis} vs ${yAxis} (크기: ${sizeAxis})`,
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 5 // default size
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: xAxis } },
          y: { title: { display: true, text: yAxis } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => [
                `${xAxis}: ${ctx.parsed.x}`,
                `${yAxis}: ${ctx.parsed.y}`,
                `${sizeAxis}: ${ctx.raw.size}`
              ]
            }
          }
        }
      }
    };
  }
  
  // Only process data if we have data
  const sizeValues = data.map(d => d[sizeAxis]);
  const minSize = Math.min(...sizeValues);
  const maxSize = Math.max(...sizeValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${xAxis} vs ${yAxis} (크기: ${sizeAxis})`,
        data: data.map(d => ({
          x: d[xAxis],
          y: d[yAxis],
          size: d[sizeAxis]
        })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointRadius: (ctx) => {
          // Safety check for empty data
          if (!ctx.raw || ctx.raw.size === undefined || !isFinite(minSize) || !isFinite(maxSize)) {
            return 5; // fallback size
          }
          const size = ctx.raw.size;
          return 3 + (size - minSize) / (maxSize - minSize) * 15;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          title: { display: true, text: yAxis }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => [
              `${xAxis}: ${ctx.parsed.x}`,
              `${yAxis}: ${ctx.parsed.y}`,
              `${sizeAxis}: ${ctx.raw.size}`
            ]
          }
        }
      }
    }
  };
}

function createScatterColorChart(data, dataset) {
  const xAxis = dataset.axes[0].name;
  const yAxis = dataset.axes[1].name;
  const colorAxis = dataset.axes[2].name;
  
  // Check for empty data FIRST, before any processing
  if (!data || data.length === 0) {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${xAxis} vs ${yAxis} (색상: ${colorAxis})`,
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(0, 0, 0, 0.2)',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: xAxis } },
          y: { title: { display: true, text: yAxis } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => [
                `${xAxis}: ${ctx.parsed.x}`,
                `${yAxis}: ${ctx.parsed.y}`,
                `${colorAxis}: ${ctx.raw.color}`
              ]
            }
          }
        }
      }
    };
  }
  
  // Only process data if we have data
  const colorValues = data.map(d => d[colorAxis]);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${xAxis} vs ${yAxis} (색상: ${colorAxis})`,
        data: data.map(d => ({
          x: d[xAxis],
          y: d[yAxis],
          color: d[colorAxis]
        })),
        backgroundColor: (ctx) => {
          // Safety check for empty data
          if (!ctx.raw || ctx.raw.color === undefined || !isFinite(minColor) || !isFinite(maxColor)) {
            return 'rgba(54, 162, 235, 0.6)'; // fallback color
          }
          const value = ctx.raw.color;
          const normalized = (value - minColor) / (maxColor - minColor);
          const hue = normalized * 240;
          return `hsl(${240 - hue}, 70%, 50%)`;
        },
        borderColor: 'rgba(0, 0, 0, 0.2)',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          title: { display: true, text: yAxis }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => [
              `${xAxis}: ${ctx.parsed.x}`,
              `${yAxis}: ${ctx.parsed.y}`,
              `${colorAxis}: ${ctx.raw.color}`
            ]
          }
        }
      }
    }
  };
}

// 3D String 시각화
function createGroupedBarChart(data, dataset) {
  const stringAxis = dataset.axes[0].name;
  const xAxis = dataset.axes[1].name;
  const yAxis = dataset.axes[2].name;
  
  const categories = [...new Set(data.map(d => d[stringAxis]))];
  const xValues = [...new Set(data.map(d => d[xAxis]))].sort((a, b) => a - b);
  
  const datasets = categories.map((cat, i) => {
    const catData = data.filter(d => d[stringAxis] === cat);
    const hue = (i / categories.length) * 360;
    
    return {
      label: cat,
      data: xValues.map(x => {
        const point = catData.find(d => d[xAxis] === x);
        return point ? point[yAxis] : null;
      }),
      backgroundColor: `hsla(${hue}, 70%, 50%, 0.8)`,
      borderColor: `hsl(${hue}, 70%, 50%)`,
      borderWidth: 1
    };
  });
  
  return {
    type: 'bar',
    data: {
      labels: xValues,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          title: { display: true, text: yAxis }
        }
      }
    }
  };
}

function createGroupedBarSizeChart(data, dataset) {
  const stringAxis = dataset.axes[0].name;
  const xAxis = dataset.axes[1].name;
  const sizeAxis = dataset.axes[2].name;
  
  const categories = [...new Set(data.map(d => d[stringAxis]))];
  
  return {
    type: 'bubble',
    data: {
      datasets: categories.map((cat, i) => {
        const catData = data.filter(d => d[stringAxis] === cat);
        const hue = (i / categories.length) * 360;
        
        return {
          label: cat,
          data: catData.map(d => ({
            x: d[xAxis],
            y: i,
            r: Math.sqrt(d[sizeAxis]) * 5
          })),
          backgroundColor: `hsla(${hue}, 70%, 50%, 0.6)`,
          borderColor: `hsl(${hue}, 70%, 50%)`
        };
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          type: 'category',
          labels: categories,
          title: { display: true, text: stringAxis }
        }
      }
    }
  };
}

function createGroupedBarColorChart(data, dataset) {
  const stringAxis = dataset.axes[0].name;
  const xAxis = dataset.axes[1].name;
  const colorAxis = dataset.axes[2].name;
  
  const categories = [...new Set(data.map(d => d[stringAxis]))];
  const colorValues = data.map(d => d[colorAxis]);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: categories.map((cat, i) => {
        const catData = data.filter(d => d[stringAxis] === cat);
        
        return {
          label: cat,
          data: catData.map(d => ({
            x: d[xAxis],
            y: i,
            color: d[colorAxis]
          })),
          backgroundColor: (ctx) => {
            const value = ctx.raw.color;
            const normalized = (value - minColor) / (maxColor - minColor);
            const hue = normalized * 240;
            return `hsl(${240 - hue}, 70%, 50%)`;
          },
          borderColor: 'rgba(0, 0, 0, 0.2)',
          pointRadius: 8
        };
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          type: 'category',
          labels: categories,
          title: { display: true, text: stringAxis }
        }
      }
    }
  };
}

// 4D 시각화
function createScatterSizeColorChart(data, dataset) {
  const xAxis = dataset.axes[0].name;
  const yAxis = dataset.axes[1].name;
  const sizeAxis = dataset.axes[2].name;
  const colorAxis = dataset.axes[3].name;
  
  // Check for empty data FIRST, before any processing
  if (!data || data.length === 0) {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${xAxis} vs ${yAxis} (크기: ${sizeAxis}, 색상: ${colorAxis})`,
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(0, 0, 0, 0.2)',
          pointRadius: 5 // default size
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: xAxis } },
          y: { title: { display: true, text: yAxis } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => [
                `${xAxis}: ${ctx.parsed.x}`,
                `${yAxis}: ${ctx.parsed.y}`,
                `${sizeAxis}: ${ctx.raw.size}`,
                `${colorAxis}: ${ctx.raw.color}`
              ],
              afterLabel: (ctx) => '\n' + ctx.raw.fullData
            }
          }
        }
      }
    };
  }
  
  // Only process data if we have data
  const sizeValues = data.map(d => d[sizeAxis]);
  const minSize = Math.min(...sizeValues);
  const maxSize = Math.max(...sizeValues);
  
  const colorValues = data.map(d => d[colorAxis]);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: [{
        label: `${xAxis} vs ${yAxis} (크기: ${sizeAxis}, 색상: ${colorAxis})`,
        data: data.map(d => ({
          x: d[xAxis],
          y: d[yAxis],
          size: d[sizeAxis],
          color: d[colorAxis],
          fullData: d._fullData
        })),
        backgroundColor: (ctx) => {
          // Safety check for empty data
          if (!ctx.raw || ctx.raw.color === undefined || !isFinite(minColor) || !isFinite(maxColor)) {
            return 'rgba(54, 162, 235, 0.6)'; // fallback color
          }
          const value = ctx.raw.color;
          const normalized = (value - minColor) / (maxColor - minColor);
          const hue = normalized * 240;
          return `hsl(${240 - hue}, 70%, 50%)`;
        },
        borderColor: 'rgba(0, 0, 0, 0.2)',
        pointRadius: (ctx) => {
          // Safety check for empty data
          if (!ctx.raw || ctx.raw.size === undefined || !isFinite(minSize) || !isFinite(maxSize)) {
            return 5; // fallback size
          }
          const size = ctx.raw.size;
          return 3 + (size - minSize) / (maxSize - minSize) * 15;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          title: { display: true, text: yAxis }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => [
              `${xAxis}: ${ctx.parsed.x}`,
              `${yAxis}: ${ctx.parsed.y}`,
              `${sizeAxis}: ${ctx.raw.size}`,
              `${colorAxis}: ${ctx.raw.color}`
            ],
            afterLabel: (ctx) => '\n' + ctx.raw.fullData
          }
        }
      }
    }
  };
}

// 4D String 시각화
function createGroupedScatterSizeColorChart(data, dataset) {
  const stringAxis = dataset.axes[0].name;
  const xAxis = dataset.axes[1].name;
  const yAxis = dataset.axes[2].name;
  const sizeAxis = dataset.axes[3].name;
  const colorAxis = dataset.axes.length > 4 ? dataset.axes[4].name : dataset.axes[3].name;
  
  const categories = [...new Set(data.map(d => d[stringAxis]))];
  
  const sizeValues = data.map(d => d[sizeAxis]);
  const minSize = Math.min(...sizeValues);
  const maxSize = Math.max(...sizeValues);
  
  const colorValues = data.map(d => d[colorAxis]);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  return {
    type: 'scatter',
    data: {
      datasets: categories.map((cat, i) => {
        const catData = data.filter(d => d[stringAxis] === cat);
        const hue = (i / categories.length) * 360;
        
        return {
          label: cat,
          data: catData.map(d => ({
            x: d[xAxis],
            y: d[yAxis],
            size: d[sizeAxis],
            color: d[colorAxis]
          })),
          backgroundColor: catData.map(d => {
            const value = d[colorAxis];
            const normalized = (value - minColor) / (maxColor - minColor);
            const colorHue = normalized * 240;
            return `hsla(${240 - colorHue}, 70%, 50%, 0.7)`;
          }),
          borderColor: `hsl(${hue}, 70%, 40%)`,
          borderWidth: 1,
          pointRadius: catData.map(d => {
            const size = d[sizeAxis];
            return 3 + (size - minSize) / (maxSize - minSize) * 12;
          })
        };
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xAxis }
        },
        y: {
          title: { display: true, text: yAxis }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const d = data.find(point => 
                point[xAxis] === ctx.parsed.x && 
                point[yAxis] === ctx.parsed.y
              );
              return [
                `${stringAxis}: ${d[stringAxis]}`,
                `${xAxis}: ${ctx.parsed.x}`,
                `${yAxis}: ${ctx.parsed.y}`,
                `${sizeAxis}: ${d[sizeAxis]}`,
                `${colorAxis}: ${d[colorAxis]}`
              ];
            }
          }
        }
      }
    }
  };
}