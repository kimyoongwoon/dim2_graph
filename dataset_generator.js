// dataset_generator.js

// 순열 계산 함수
function permutation(n, r) {
  if (r > n) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
  }
  return result;
}

// 순열 생성 함수
function generatePermutations(arr, r) {
  const results = [];
  
  function permute(current, remaining, depth) {
    if (depth === r) {
      results.push([...current]);
      return;
    }
    
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      const newRemaining = remaining.filter((_, idx) => idx !== i);
      permute(current, newRemaining, depth + 1);
      current.pop();
    }
  }
  
  permute([], arr, 0);
  return results;
}

export function generateDatasets(selectedDimensionData, originalData) {
  const { selectedDimension, analysisResults } = selectedDimensionData;
  const { j, k, n, m, totalDim, hasString } = analysisResults;
  
  const datasets = [];
  
  // 축 이름 생성
  const inputAxes = [];
  const outputAxes = [];
  
  // 원본 데이터에서 축 이름 가져오기
  if (originalData && originalData.basic_data) {
    const axisNames = originalData.basic_data.axes.map(a => a.name);
    for (let i = 0; i < j; i++) {
      inputAxes.push({ name: axisNames[i] || `X${i}`, type: 'input', index: i });
    }
  } else {
    for (let i = 0; i < j; i++) {
      inputAxes.push({ name: `X${i}`, type: 'input', index: i });
    }
  }
  
  // 출력 축 생성
  if (hasString) {
    outputAxes.push({ name: 'String', type: 'string', index: -1 });
    for (let i = 0; i < m; i++) {
      outputAxes.push({ name: `Y${i}`, type: 'output', index: i });
    }
  } else {
    for (let i = 0; i < m; i++) {
      outputAxes.push({ name: `Y${i}`, type: 'output', index: i });
    }
  }
  
  const allAxes = [...inputAxes, ...outputAxes];
  
  // 선택된 차원과 string 유무에 따라 데이터셋 생성
  if (!hasString) {
    generateDatasetsNoString(selectedDimension, n, m, allAxes, inputAxes, datasets);
  } else {
    generateDatasetsWithString(selectedDimension, n, m, allAxes, inputAxes, datasets);
  }
  
  // allAxes를 별도로 포함하여 반환
  return {
    allAxes: allAxes,
    datasets: datasets
  };
}

function generateDatasetsNoString(dimension, n, m, allAxes, inputAxes, datasets) {
  const totalDim = n + m;
  
  switch (dimension) {
    case 1:
      if (totalDim >= 1) {
        // n+m개의 dataset
        allAxes.forEach(axis => {
          datasets.push({
            name: `1D - ${axis.name}`,
            axes: [axis],
            dataType: '1D',
            visualizationTypes: [
              { name: '수직선', type: 'line1d' }
            ]
          });
        });
      }
      break;
      
    case 2:
      if (totalDim >= 2) {
        // n+mP2개의 순열 생성
        const perms = generatePermutations(allAxes, 2);
        
        perms.forEach(perm => {
          datasets.push({
            name: `2D - ${perm[0].name}, ${perm[1].name}`,
            axes: perm,
            dataType: '2D',
            visualizationTypes: [
              { name: '크기', type: 'size' },
              { name: '색상', type: 'color' },
              { name: '산점도', type: 'scatter' }
            ]
          });
        });
      }
      break;
      
    case 3:
      if (totalDim >= 3) {
        // n+mP3개의 순열 생성
        const perms = generatePermutations(allAxes, 3);
        
        perms.forEach(perm => {
          datasets.push({
            name: `3D - ${perm[0].name}, ${perm[1].name}, ${perm[2].name}`,
            axes: perm,
            dataType: '3D',
            visualizationTypes: [
              { name: '크기+색상', type: 'size_color' },
              { name: '산점도+크기', type: 'scatter_size' },
              { name: '산점도+색상', type: 'scatter_color' }
            ]
          });
        });
      }
      break;
      
    case 4:
      if (totalDim >= 4) {
        // n+mP4개의 순열 생성
        const perms = generatePermutations(allAxes, 4);
        
        perms.forEach(perm => {
          datasets.push({
            name: `4D - ${perm[0].name}, ${perm[1].name}, ${perm[2].name}, ${perm[3].name}`,
            axes: perm,
            dataType: '4D',
            visualizationTypes: [
              { name: '산점도+크기+색상', type: 'scatter_size_color' }
            ]
          });
        });
      }
      break;
  }
}

function generateDatasetsWithString(dimension, n, m, allAxes, inputAxes, datasets) {
  const totalDim = n + m;
  const stringAxis = allAxes.find(a => a.type === 'string');
  const nonStringAxes = allAxes.filter(a => a.type !== 'string');
  
  switch (dimension) {
    case 1:
      if (totalDim >= 0) {
        // String 축 추가
        datasets.push({
          name: `1D - ${stringAxis.name}`,
          axes: [stringAxis],
          dataType: '1D-String',
          visualizationTypes: [
            { name: '카테고리', type: 'category' }
          ]
        });
        
        // 나머지 축들
        nonStringAxes.forEach(axis => {
          datasets.push({
            name: `1D - ${axis.name}`,
            axes: [axis],
            dataType: '1D',
            visualizationTypes: [
              { name: '수직선', type: 'line1d' }
            ]
          });
        });
      }
      break;
      
    case 2:
      if (totalDim >= 1) {
        // String이 x축인 경우 (String과 다른 축의 조합)
        nonStringAxes.forEach(axis => {
          datasets.push({
            name: `2D - ${stringAxis.name}, ${axis.name}`,
            axes: [stringAxis, axis],
            dataType: '2D-String',
            visualizationTypes: [
              { name: '막대-크기', type: 'bar_size' },
              { name: '막대-색상', type: 'bar_color' },
              { name: '막대그래프', type: 'bar' }
            ]
          });
        });
        
        // 비String 축들끼리의 조합
        const perms = generatePermutations(nonStringAxes, 2);
        perms.forEach(perm => {
          datasets.push({
            name: `2D - ${perm[0].name}, ${perm[1].name}`,
            axes: perm,
            dataType: '2D',
            visualizationTypes: [
              { name: '크기', type: 'size' },
              { name: '색상', type: 'color' },
              { name: '산점도', type: 'scatter' }
            ]
          });
        });
      }
      break;
      
    case 3:
      if (totalDim >= 2) {
        // String이 x축인 경우 (String + 2개 축)
        const perms2 = generatePermutations(nonStringAxes, 2);
        perms2.forEach(perm => {
          datasets.push({
            name: `3D - ${stringAxis.name}, ${perm[0].name}, ${perm[1].name}`,
            axes: [stringAxis, ...perm],
            dataType: '3D-String',
            visualizationTypes: [
              { name: '막대-크기', type: 'grouped_bar_size' },
              { name: '그룹막대', type: 'grouped_bar' },
              { name: '막대-색상', type: 'grouped_bar_color' }
            ]
          });
        });
        
        // 비String 축들끼리의 조합
        if (totalDim === 2) {
          // 특수 케이스: n+m = 2일 때는 String + 2개만 가능
        } else {
          const perms3 = generatePermutations(nonStringAxes, 3);
          perms3.forEach(perm => {
            datasets.push({
              name: `3D - ${perm[0].name}, ${perm[1].name}, ${perm[2].name}`,
              axes: perm,
              dataType: '3D',
              visualizationTypes: [
                { name: '크기+색상', type: 'size_color' },
                { name: '산점도+크기', type: 'scatter_size' },
                { name: '산점도+색상', type: 'scatter_color' }
              ]
            });
          });
        }
      }
      break;
      
    case 4:
      if (totalDim >= 3) {
        // String이 x축인 경우 (String + 3개 축)
        const perms3 = generatePermutations(nonStringAxes, 3);
        perms3.forEach(perm => {
          datasets.push({
            name: `4D - ${stringAxis.name}, ${perm[0].name}, ${perm[1].name}, ${perm[2].name}`,
            axes: [stringAxis, ...perm],
            dataType: '4D-String',
            visualizationTypes: [
              { name: '그룹산점도+크기+색상', type: 'grouped_scatter_size_color' }
            ]
          });
        });
        
        // 비String 축들끼리의 조합
        if (totalDim === 3) {
          // 특수 케이스: n+m = 3일 때는 String + 3개만 가능
        } else {
          const perms4 = generatePermutations(nonStringAxes, 4);
          perms4.forEach(perm => {
            datasets.push({
              name: `4D - ${perm[0].name}, ${perm[1].name}, ${perm[2].name}, ${perm[3].name}`,
              axes: perm,
              dataType: '4D',
              visualizationTypes: [
                { name: '산점도+크기+색상', type: 'scatter_size_color' }
              ]
            });
          });
        }
      }
      break;
  }
}