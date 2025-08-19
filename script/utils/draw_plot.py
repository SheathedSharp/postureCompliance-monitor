'''
Plotting utilities for patient compliance visualization
Functions to generate charts and graphs for compliance analysis
'''

import matplotlib.pyplot as plt
import numpy as np
import torch

# 设置字体
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial']


def compliance_with_intervention_plot(model, test_features, test_labels, r2):
    """
    绘制干预效果图（完全干预）
    @param model: 模型
    @param test_features: 测试数据
    @param test_labels: 测试标签
    @param r2: 拟合系数
    """
    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    time_points = np.linspace(0, 1799, 1800)

    # 计算所有夜间测试患者的平均合格率和标准差
    patients = list(set(feat['patient'] for feat in test_features))
    all_data = []

    for patient in patients:
        patient_data = []
        for period in range(4):
            period_indices = [i for i, feat in enumerate(test_features)
                              if feat['patient'] == patient and feat['period'] == period]
            if period_indices:
                patient_data.append(test_labels[period_indices[0]])
        if patient_data:
            patient_mean = np.mean(patient_data, axis=0)
            all_data.append(patient_mean)

    # 计算并绘制所有患者的平均线和置信区间
    if all_data:
        overall_mean = np.mean(all_data, axis=0)
        overall_std = np.std(all_data, axis=0)

        # 绘制平均值线和置信区间
        ax.plot(time_points / 60, overall_mean,
                color='#2878B5',
                linestyle='--',
                linewidth=1.5,
                alpha=0.8,
                label='Average compliance')

        ax.fill_between(time_points / 60,
                        overall_mean - overall_std,
                        overall_mean + overall_std,
                        color='#2878B5',
                        alpha=0.2,
                        label='95% confidence interval')

    # 绘制拟合曲线
    with torch.no_grad():
        X = torch.FloatTensor(time_points.reshape(-1, 1) / 1800.0)
        pred = model(X)
        ax.plot(time_points / 60, pred.numpy(),
                color='#C44E52',
                linewidth=2,
                # label=f'Fitted curve (R² = {r2:.3f})')
                label=f'Fitted curve')

        # 设置坐标轴和标签
    ax.set_xlabel('Time (minutes)', fontweight='bold')
    ax.set_ylabel('Compliance (%)', fontweight='bold')
    ax.set_title(' Patients Intervention Effect',
                 fontweight='bold',
                 pad=15)

    # 设置网格线
    ax.grid(True, linestyle='--', alpha=0.7)

    # 设置y轴范围，留有适当空间显示误差带
    y_min = min(overall_mean - overall_std) - 1
    y_max = max(overall_mean + overall_std) + 1
    ax.set_ylim(y_min, y_max)

    # 优化图例
    ax.legend(loc='lower right',
              frameon=True,
              framealpha=0.95,
              edgecolor='none',
              fancybox=True,
              shadow=True)

    # 添加边框
    for spine in ax.spines.values():
        spine.set_linewidth(1.5)

    plt.tight_layout()
    plt.show()
