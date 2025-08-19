'''
Angle difference analysis for ISTT (Intervention Start Time Threshold)
Calculates angular differences for intervention timing analysis
'''
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.spatial import cKDTree
from scipy.stats import ttest_ind

from utils.show_visualization import show_visualization

def filter_angles(df, max_angle=0):
    # 剔除x轴或者y轴或者z轴体角度在[-may_angle, may_angle]范围内的数据
    filter_records = df[df['y轴角度'].abs() >= max_angle]

    return filter_records



def analyze_density_difference(df):
    filter_records = filter_angles(df, 0)

    # 左偏
    left = filter_records[filter_records['y轴角度'] < 0]

    # 右偏
    right = filter_records[filter_records['y轴角度'] > 0]

    print("左偏区域样本量:", len(left))
    print("右偏区域样本量:", len(right))


    # 计算均值和标准差
    left_mean = np.mean(left['y轴角度'].abs())
    left_std = np.std(left['y轴角度'])
    right_mean = np.mean(right['y轴角度'].abs())
    right_std = np.std(right['y轴角度'])

    # 打印均值和标准差
    print(f"左侧区域均值: {left_mean}, 标准差: {left_std}")
    print(f"右侧区域均值: {right_mean}, 标准差: {right_std}")

    # 进行独立样本 t 检验
    t_stat, p_value = ttest_ind(left['y轴角度'].abs(), right['y轴角度'].abs())

    # 计算效应量 Cohen's d
    pooled_std = np.sqrt((left_std ** 2 + right_std ** 2) / 2)
    cohen_d = (right_mean - left_mean) / pooled_std

    return t_stat, p_value, left_mean, left_std, right_mean, right_std, cohen_d, left['y轴角度'], right['y轴角度']



file_url = show_visualization()


# 读取数据
df = pd.read_csv(file_url)

# 分析差异
t_stat, p_value, left_mean, left_std, right_mean, right_std, cohen_d, left, right = analyze_density_difference(
    df)

print(f"T统计量: {t_stat}, p值: {p_value}")
print(f"Cohen's d: {cohen_d}")

if p_value < 0.05:
    print("存在显著性差异")
else:
    print("不存在显著性差异")
