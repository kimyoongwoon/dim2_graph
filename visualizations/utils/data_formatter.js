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