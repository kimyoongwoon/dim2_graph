from typing import Any, List, Tuple
import random
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class AxisSpec:
    """
    축 설정 클래스
    name: 축 이름
    minimum: 최소값
    maximum: 최대값
    interval: 간격
    allow_duplicates: 중복 허용 여부
    """
    name: str
    minimum: float
    maximum: float
    interval: float
    allow_duplicates: bool

    def __post_init__(self):
        """유효성 검증"""
        if self.interval <= 0:
            raise ValueError(f"Interval must be positive, got {self.interval}")
        if self.minimum >= self.maximum:
            raise ValueError(f"Minimum ({self.minimum}) must be less than maximum ({self.maximum})")

def random_coordinate(axis: AxisSpec) -> float:
    """axis.minimum + k * axis.interval 형태의 랜덤 좌표 하나 생성"""
    try:
        range_size = axis.maximum - axis.minimum
        k_max = int(range_size / axis.interval)
        
        if k_max < 0:
            k_max = 0
            
        k = random.randint(0, k_max)
        result = axis.minimum + k * axis.interval
        
        # 최대값 초과 방지
        if result > axis.maximum:
            result = axis.maximum
            
        return result
    except Exception as e:
        logger.error(f"Error generating coordinate for axis {axis.name}: {e}")
        return axis.minimum

def random_value(value_type: str, arr_num: int = 3) -> Any:
    """
    value_type에 따라 랜덤 값 생성:
      - "double": 0.0~1.0 사이 실수
      - "string_double": 문자열+정수
      - "array": 숫자 배열
      - "string_array": 문자열+숫자 배열
    """
    try:
        if value_type == "double":
            return round(random.random(), 6)
        elif value_type == "string_double":
            animals = ["사자", "호랑이", "코끼리", "기린", "얼룩말", "하마"]
            s = random.choice(animals)
            return [s, [round(random.random(), 3)]]
        elif value_type == "array":
            return [round(random.random(), 3) for _ in range(arr_num)]
        elif value_type == "string_array":
            animals = ["사자", "호랑이", "코끼리", "기린", "얼룩말", "하마"]
            s = random.choice(animals)
            return [s, [round(random.random(), 3) for _ in range(arr_num)]]
        else:
            raise ValueError(f"Unknown value_type: {value_type}")
    except Exception as e:
        logger.error(f"Error generating random value: {e}")
        return 0.0  # 기본값 반환

def generate_point(axis_specs: List[AxisSpec], value_type: str, arr_num: int = 3) -> Tuple[List[float], Any]:
    """하나의 점에 대해 좌표 리스트와 value 생성"""
    try:
        coords = [random_coordinate(ax) for ax in axis_specs]
        value = random_value(value_type, arr_num)
        return coords, value
    except Exception as e:
        logger.error(f"Error generating point: {e}")
        # 에러 시 기본값 반환
        coords = [ax.minimum for ax in axis_specs]
        return coords, 0.0