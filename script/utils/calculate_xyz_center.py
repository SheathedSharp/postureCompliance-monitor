'''
XYZ center calculation utilities for posture analysis
Functions to compute center vectors and spatial reference points
'''
import numpy as np
import pandas as pd


def calculate_center_vetor(data):
    """
    计算数据集的中心向量
    :param data: pandas DataFrame, 包含x轴角度、y轴角度和z轴角度的数据
    :return: 三个平均角度
    """
    if not isinstance(data, pd.DataFrame):
        raise TypeError("Input data must be a pandas DataFrame")
    
    # 将角度转换为弧度
    x_radians = np.deg2rad(data['x轴角度'])
    y_radians = np.deg2rad(data['y轴角度'])
    z_radians = np.deg2rad(data['z轴角度'])

    # 计算平均向量
    x_mean_sin = np.sin(x_radians).mean()
    x_mean_cos = np.cos(x_radians).mean()
    y_mean_sin = np.sin(y_radians).mean()
    y_mean_cos = np.cos(y_radians).mean()
    z_mean_sin = np.sin(z_radians).mean()
    z_mean_cos = np.cos(z_radians).mean()

    # 将平均向量转换回角度
    x_mean = np.rad2deg(np.arctan2(x_mean_sin, x_mean_cos))
    y_mean = np.rad2deg(np.arctan2(y_mean_sin, y_mean_cos))
    z_mean = np.rad2deg(np.arctan2(z_mean_sin, z_mean_cos))

    return x_mean, y_mean, z_mean


def calculate_center_value(data):
    """
    (已废弃)计算数据集的中心向量
    :param data: list, 包含x轴角度、y轴角度和z轴角度的数据
    :return: 三个平均角度
    """
    # 将角度转换为单位向量
    x_coords = np.radians([entry["x轴角度"] for entry in data])
    y_coords = np.radians([entry["y轴角度"] for entry in data])
    z_coords = [entry["z轴角度"] for entry in data]

    x_unit = np.array([z * np.cos(x) * np.cos(y)
                      for x, y, z in zip(x_coords, y_coords, z_coords)])
    y_unit = np.array([z * np.sin(x) * np.cos(y)
                      for x, y, z in zip(x_coords, y_coords, z_coords)])
    z_unit = np.array([z * np.sin(y)
                      for x, y, z in zip(x_coords, y_coords, z_coords)])

    # 计算向量的平均值
    mean_x = np.mean(x_unit)
    mean_y = np.mean(y_unit)
    mean_z = np.mean(z_unit)

    # 将平均向量转换回球面坐标
    center_radius = np.sqrt(mean_x**2 + mean_y**2 + mean_z**2)
    center_azimuth = np.degrees(np.arctan2(mean_y, mean_x))
    center_elevation = np.degrees(np.arctan2(
        mean_z, np.sqrt(mean_x**2 + mean_y**2)))

    return center_azimuth, center_elevation, center_radius
