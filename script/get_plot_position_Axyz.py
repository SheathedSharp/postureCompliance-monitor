'''
Axyz position plotting script
Generates visualizations for patient position data analysis
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
    counts = tree.query_ball_point(grid_points, r=0.375)
    density = np.array([len(c) for c in counts]).reshape(x_sphere.shape)

    return x_sphere, y_sphere, z_sphere, density


def plot_sphere(ax, x_sphere, y_sphere, z_sphere, density, view_angle, center_x, center_y, center_z, show_arrows=False, show_legend=False):
    """
    绘制球面上的点浮动的热力区域
    :param ax: 3D坐标轴
    :param x_sphere, y_sphere, z_sphere: 计算好的球面网格点坐标
    :param density: 计算好的球面网格点密度
    :param view_angle: 视角
    :param center_x, center_y, center_z: 某个体位中心点初始坐标
    :param show_arrows: 是否显示箭头

    """
    ax.view_init(elev=view_angle[0], azim=view_angle[1])

    # 颜色映射
    norm = plt.Normalize(vmin=density.min(), vmax=density.max())
    colors = plt.cm.jet(norm(density))

    # 绘制点
    center_x_rad = np.deg2rad(center_x)     # 将角度转换为弧度
    center_y_rad = np.deg2rad(center_y)
    center_z_rad = np.deg2rad(center_z)
    center_x = np.sin(center_x_rad)
    center_y = np.sin(center_y_rad)
    center_z = np.sin(center_z_rad)
    print(center_x, center_y, center_z)

    # 绘制球体表面
    ax.plot_surface(x_sphere, y_sphere, z_sphere, facecolors=colors,
                    rstride=1, cstride=1, alpha=0.9, antialiased=True, zorder=1)
    ax.scatter(center_x, center_y, center_z+0.1, color='grey',
               s=75, depthshade=False, zorder=2)

    # 创建箭头图标的Line2D对象，用作图例项
    arrow_legend = mlines.Line2D([], [], color='red', marker=r'$\rightarrow$',
                                 markersize=15, label='Patient Face Direction')
    dot_legend = mlines.Line2D([], [], color='grey', marker='o',
                               markersize=10, label='The average initial point of the patients')

    # 显示箭头
    if show_arrows:
        # @需要修改的地方
        # 添加箭头和标签

        # # @FD 朝向下患者的
        ax.quiver(1, 1, 1, 0, 0, -1, color='red',
                  arrow_length_ratio=0.2, length=2)
        ax.quiver(1, 0, 1, 0, 0, -1, color='red',
                  arrow_length_ratio=0.2, length=2)
        ax.quiver(1, -1, 1, 0, 0, -1, color='red',
                  arrow_length_ratio=0.2, length=2)
        ax.quiver(0, 1, 1, 0, 0, -1, color='red',
                  arrow_length_ratio=0.2, length=2)
        ax.quiver(-1, 1, 1, 0, 0, -1, color='red',
                  arrow_length_ratio=0.2, length=2)

        # @SS 半坐卧位患者的
        # ax.quiver(-1, 1, 1, 1, 0, 0, color='red',
        #           arrow_length_ratio=0.2, length=2)
        # ax.quiver(-1, 1, 0, 1, 0, 0, color='red',
        #           arrow_length_ratio=0.2, length=2)
        # ax.quiver(-1, 1, -1, 1, 0, 0, color='red',
        #           arrow_length_ratio=0.2, length=2)
        # ax.quiver(-1, -1, 1, 1, 0, 0, color='red',
        #           arrow_length_ratio=0.2, length=2)
        # ax.quiver(-1, -1, 0, 1, 0, 0, color='red',
        #           arrow_length_ratio=0.2, length=2)
        # ax.quiver(-1, -1, -1, 1, 0, 0, color='red',
        #           arrow_length_ratio=0.2, length=2)

    if show_legend:
        # 设置图例，将箭头图标和散点图标组合在一起
        handles, labels = ax.get_legend_handles_labels()
        handles.extend([arrow_legend, dot_legend])
        ax.legend(handles=handles, loc='lower center', bbox_to_anchor=(
            0.5, -0.25), fancybox=True, shadow=True)

    ax.set_title(f'view:{view_angle}')


def plot_sphere_views(data_df, OXYZ_df, view_angles):
    """
    绘制俯视角度的球面热力图
    :param data_df: 某个体位患者的全部数据
    :param OXYZ_df: 某个体位患者的初始XYZ坐标
    :param view_angles: 视角
    """
    fig = plt.figure(figsize=(8, 8))  # 修改图像大小为正方形

    # 计算密度和热点区域，使用固定中心点(0,0,1)
    x_sphere, y_sphere, z_sphere, density = compute_point_density(
        data_df, 0, 0, 90)  # 将中心点设为(0,0,90度)，对应球面上的(0,0,1)

    # 计算每个网格中点的数量的百分比
    total_points = density.sum()
    percent_density = (density / total_points) * 100 * 100

    # 只添加一个俯视图
    ax = fig.add_subplot(111, projection='3d')
    plot_sphere(ax, x_sphere, y_sphere, z_sphere, percent_density,
                (90, 0), 0, 0, 90, show_arrows=True, show_legend=True)

    # 隐藏刻度，保留网格线
    ax.set_xticklabels([])
    ax.set_yticklabels([])
    ax.set_zticklabels([])
    ax.grid(True)

    # 添加颜色条
    norm = plt.Normalize(vmin=percent_density.min(),
                         vmax=percent_density.max())
    sm = plt.cm.ScalarMappable(cmap=plt.cm.jet, norm=norm)
    sm.set_array([])
    cbar = plt.colorbar(sm, ax=fig.get_axes(), fraction=0.07,
                        pad=0.1, location='right')
    cbar.set_label('Percentage of points in this grid (%)')

    plt.tight_layout()
    plt.show()


# 输入特殊体位文件名
position = input(
    "please input the special postion file which you want to check(please input the abbreviation):")
# 读取某个体位的患者的全部数据(查看该文件的后缀名)，使用csv文件还是excel文件
data_df = pd.read_csv(f'./data/position_data/{position}_revision.csv')
# data_df = pd.read_excel(f'./data/position_data/{position}_revision.xlsx')

# data_df = pd.read_excel('./data/alert_on_off/right_off/郭俊辉117413.xlsx')


# 读取某个体位的患者的初始XYZ坐标
OXYZ_df = pd.read_excel(f'./data/position_data/FD_origin.xlsx')

# 只需要俯视角度
view_angles = [(90, 0)]  # 俯视视角

# 调用函数进行绘制
plot_sphere_views(data_df, OXYZ_df, view_angles)
