'''
Oxyz position plotting script
Generates visualizations for patient position data using original XYZ methods
'''
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from utils.calculate_xyz_center import calculate_center_vetor


def plot_sphere(ax, data_df, view_angle, center_x, center_y, center_z):
    """
    绘制某个体位患者初始点分布球面
    :param ax: 画布
    :param data_df: 数据
    :param view_angle: 视角
    :param center_x: 中心点x坐标
    :param center_y: 中心点y坐标
    :param center_z: 中心点z坐标
    """
    ax.view_init(elev=view_angle[0], azim=view_angle[1])

    # 将角度转换为弧度
    center_x_rad = np.deg2rad(center_x)
    center_y_rad = np.deg2rad(center_y)
    center_z_rad = np.deg2rad(center_z)
    x_rad = np.deg2rad(data_df['x轴角度'])
    y_rad = np.deg2rad(data_df['y轴角度'])
    z_rad = np.deg2rad(data_df['z轴角度'])

    # 计算球面上的点
    center_x = np.sin(center_x_rad)
    center_y = np.sin(center_y_rad)
    center_z = np.sin(center_z_rad)
    x = np.sin(x_rad)
    y = np.sin(y_rad)
    z = np.sin(z_rad)


    ax.scatter(x[0], y[0], z[0], color='red', s=15, label='Center Initial Point')
    # ax.scatter(center_x, center_y, center_z, color='red', s=15, label='Center Initial Point')
    ax.scatter(x, y, z, color='grey', s=3, label='Patient Initial Points')

    u = np.linspace(0, 2 * np.pi, 100)
    v = np.linspace(0, np.pi, 100)
    x = np.outer(np.cos(u), np.sin(v))
    y = np.outer(np.sin(u), np.sin(v))
    z = np.outer(np.ones(np.size(u)), np.cos(v))
    ax.plot_surface(x, y, z, color='b', alpha=0.1)
    
    # @需要修改的地方
    # 添加箭头和标签
    # ax.quiver(0, 0, 0, 0, 0, -1, color='red', arrow_length_ratio=0.1, label='Patient Face Direction') # 面向下患者的
    # ax.quiver(0, 0, 0, -1, 0, 0, color='red', arrow_length_ratio=0.1, label='Patient Face Direction') # 半坐卧位患者的
    # ax.quiver(0, 0, 0, 1, 0, 0, color='red', arrow_length_ratio=0.1, label='Patient Face Direction') # 右侧卧位患者的
    ax.quiver(0, 0, 0, 1, 0, 0, color='red', arrow_length_ratio=0.1, label='Patient Face Direction') # 左侧卧位患者的


    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.set_title(f'view:{view_angle}')


def plot_sphere_views(data_df, view_angles):
    """
    绘制各个视角中球面上的初始点与中心点分布图
    :param data_df: 数据
    :param view_angles: 视角列表
    """
    fig = plt.figure(figsize=(15, 10))

    for i, view_angle in enumerate(view_angles, start=1):
        ax = fig.add_subplot(2, 4, i, projection='3d')

        # 计算中心点坐标
        print(data_df)
        center_x, center_y, center_z = calculate_center_vetor(data_df)
        print(center_x, center_y, center_z)
        plot_sphere(ax, data_df, view_angle, center_x, center_y, center_z)

        if i == 2:
            ax.set_xticks([])  # 隐藏X轴刻度标签
        if i == 3:
            ax.set_zticks([])  # 隐藏Z轴刻度标签
        if i == 4:
            ax.set_yticks([])  # 隐藏Y轴刻度标签

    # 调整图例位置
    plt.legend(loc='lower center', bbox_to_anchor=(0.5, -0.25), fancybox=True, shadow=True)
    plt.tight_layout()
    plt.show()

# 输入特殊体位文件名
position = input(
    "please input the special postion file which you want to check(please input the abbreviation):")
# 读取某个体位的患者的初始信息
data_df = pd.read_excel(f'./data/position_data/{position}_origin.xlsx')

# print(data_df)

# 设置视角
view_angles = [
    (45, 45),
    (0, 0),     # 正X轴方向
    (90, 0),    # 正Y轴方向
    (0, 90),    # 正Z轴方向
]

# 调用函数进行绘制
plot_sphere_views(data_df, view_angles)
