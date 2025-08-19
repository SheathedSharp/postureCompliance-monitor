'''
Axyz position plotting with center vector analysis
Generates visualizations for patient position data with center vector calculations
'''
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
from scipy.stats import gaussian_kde
from scipy.spatial import cKDTree
from utils.calculate_xyz_center import calculate_center_vetor
from utils.get_xyz_value import map_points_to_sphere

def compute_center_vector(data_df, center_x, center_y, center_z):
    """
    计算所有向量的合成向量，以获得中心向量。
    :param data_df: 某个体位患者的全部数据
    :param center_x, center_y, center_z: 中心点坐标
    :return: 中心向量 (center_vector_x, center_vector_y, center_vector_z)
    """
    # 将角度转换为弧度
    center_x_rad = np.deg2rad(center_x)
    center_y_rad = np.deg2rad(center_y)
    center_z_rad = np.deg2rad(center_z)
    diff_x_rad = np.deg2rad(data_df['x轴角度'])
    diff_y_rad = np.deg2rad(data_df['y轴角度'])
    diff_z_rad = np.deg2rad(data_df['z轴角度'])

    # 弧度相加
    x_rad = center_x_rad + diff_x_rad
    y_rad = center_y_rad + diff_y_rad
    z_rad = center_z_rad + diff_z_rad

    # 计算每个点的向量分量
    x_vector = np.sin(x_rad)
    y_vector = np.sin(y_rad)
    z_vector = np.sin(z_rad)

    # 合成所有向量
    center_vector_x = np.sum(x_vector)
    center_vector_y = np.sum(y_vector)
    center_vector_z = np.sum(z_vector)

    # 正则化中心向量（可选）
    magnitude = np.sqrt(center_vector_x**2 + center_vector_y**2 + center_vector_z**2)
    if magnitude > 0:
        center_vector_x /= magnitude
        center_vector_y /= magnitude
        center_vector_z /= magnitude

    return center_vector_x, center_vector_y, center_vector_z

def plot_sphere_with_vector(center_vector):
    """
    绘制一个球体，并在球体上绘制中心向量。
    
    :param center_vector: (center_vector_x, center_vector_y, center_vector_z) 中心向量的分量
    """
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # 创建球体
    u = np.linspace(0, 2 * np.pi, 100)
    v = np.linspace(0, np.pi, 100)
    x_sphere = np.outer(np.cos(u), np.sin(v))
    y_sphere = np.outer(np.sin(u), np.sin(v))
    z_sphere = np.outer(np.ones(np.size(u)), np.cos(v))

    # 绘制球体
    ax.plot_surface(x_sphere, y_sphere, z_sphere, color='c', alpha=0.3, rstride=5, cstride=5, linewidth=0.5, edgecolor='k')

    # 绘制中心向量
    ax.quiver(0, 0, 0, center_vector[0], center_vector[1], center_vector[2], color='r', linewidth=2, arrow_length_ratio=0.1)

    # 设置图像参数
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')

    # 设置球体边界
    ax.set_xlim([-1, 1])
    ax.set_ylim([-1, 1])
    ax.set_zlim([-1, 1])

    # 设置视角，绕 z 轴顺时针旋转 90 度
    ax.view_init(elev=20., azim=45)
    ax.set_axis_off()
    
    # 隐藏网格线和坐标轴背景
    plt.grid(False)
    plt.show()

def compute_point_density(data_df, center_x, center_y, center_z):
    """
    计算球面网格上的点密度
    :param data_df: 某个体位患者的全部数据
    :param center_x, center_y, center_z: 中心点坐标
    :return: x_sphere, y_sphere, z_sphere, density
    """
    # 将角度转换为弧度
    center_x_rad = np.deg2rad(center_x)
    center_y_rad = np.deg2rad(center_y)
    center_z_rad = np.deg2rad(center_z)
    diff_x_rad = np.deg2rad(data_df['x轴角度'])
    diff_y_rad = np.deg2rad(data_df['y轴角度'])
    diff_z_rad = np.deg2rad(data_df['z轴角度'])

    # 弧度相加
    x_rad = center_x_rad + diff_x_rad
    y_rad = center_y_rad + diff_y_rad
    z_rad = center_z_rad + diff_z_rad

    # 计算球面上的点
    center_x = np.sin(center_x_rad)
    center_y = np.sin(center_y_rad)
    center_z = np.sin(center_z_rad)
    x = np.sin(x_rad)
    y = np.sin(y_rad)
    z = np.sin(z_rad)

    # 映射异常点到球面上
    x, y, z = map_points_to_sphere(x, y, z)

    # 创建球面网格
    u = np.linspace(0, 2 * np.pi, 100)
    v = np.linspace(0, np.pi, 100)
    x_sphere = np.outer(np.cos(u), np.sin(v))
    y_sphere = np.outer(np.sin(u), np.sin(v))
    z_sphere = np.outer(np.ones(np.size(u)), np.cos(v))

    # 使用cKDTree计算每个网格点周围的点数量
    tree = cKDTree(np.vstack([x, y, z]).T)
    grid_points = np.vstack(
        [x_sphere.ravel(), y_sphere.ravel(), z_sphere.ravel()]).T

    # @需要修改的地方 r=0.275是一个经验值，可以根据实际情况调整
    counts = tree.query_ball_point(grid_points, r=0.275)
    density = np.array([len(c) for c in counts]).reshape(x_sphere.shape)

    return x_sphere, y_sphere, z_sphere, density

def plot_sphere_views(data_df, OXYZ_df):
    """
    绘制各个视角中球面上的点浮动的热力区域
    :param data_df: 某个体位患者的全部数据
    :param OXYZ_df: 某个体位患者的初始XYZ坐标
    """
    # 计算中心点坐标
    center_x, center_y, center_z = calculate_center_vetor(OXYZ_df)
    
    # 计算中心向量并且绘制
    center_vector = compute_center_vector(data_df, center_x, center_y, center_z)
    plot_sphere_with_vector(center_vector)

# 输入特殊体位文件名
position = input(
    "please input the special postion file which you want to check(please input the abbreviation):")

# 读取某个体位的患者的全部数据(查看该文件的后缀名)，使用csv文件还是excel文件
data_df = pd.read_csv(f'./data/position_data/{position}_revision.csv')
# data_df = pd.read_excel(f'./data/position_data/{position}_revision.xlsx')


# 读取某个体位的患者的初始XYZ坐标
OXYZ_df = pd.read_excel(f'./data/position_data/{position}_origin.xlsx')

# 调用函数进行绘制
plot_sphere_views(data_df, OXYZ_df)