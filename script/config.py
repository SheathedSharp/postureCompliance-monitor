'''
Configuration settings for posture compliance monitoring data processing
Contains paths, parameters, and settings for analysis pipeline
'''
from pathlib import Path

# 项目根目录
ROOT_DIR = Path(__file__).parent

# 数据相关目录
DATA_DIR = {
    'root': ROOT_DIR / 'data',
    'patient_origin': ROOT_DIR / 'data' / 'patient_origin_data', # 所有患者的原始数据
    'night_origin': ROOT_DIR / 'data' / 'night_origin_data', # 夜间患者的原始数据
    'day_origin': ROOT_DIR / 'data' / 'day_origin_data', # 日间患者的原始数据
    'position': ROOT_DIR / 'data' / 'position_data', # 所有体位患者数据
}

# 数据处理相关配置
DATA_PROCESSING = {
    'test_ratio': 0.2,
    'random_seed': 42,
}

# 可视化相关配置
VISUALIZATION = {
    'figure_size': (15, 6),
    'view_angles': [
        (45, 45),
        (0, 0),    # 正X轴方向
        (90, 0),   # 正Y轴方向
        (0, 90)    # 正Z轴方向
    ]
}