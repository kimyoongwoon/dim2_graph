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