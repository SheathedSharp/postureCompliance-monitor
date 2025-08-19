'''
XYZ value calculation utilities for patient posture analysis
Functions to extract and process spatial orientation data from patient measurements
'''
import pandas as pd
import matplotlib.pyplot as plt
import os
import re
import numpy as np


def get_patient_detail_data(patient_name, data_dir='./data/patient_origin_data'):
    """
    根据患者名称获取患者数据
    :param patient_name: 患者名称
    :param data_dir: 数据文件夹路径，默认为'./patient_origin_data'
    :return: 患者数据的DataFrame，如果未找到则返回None
    """
    all_files = os.listdir(data_dir)

    for filename in all_files:
        if patient_name in filename:
            patient_file = os.path.join(data_dir, filename)
            return pd.read_excel(patient_file)

    print(f"未找到患者'{patient_name}'的数据文件")
    return None


def get_patient_detail_data_alert_on_off(patient_name, right_or_left, on_or_off, src_dir='./data/alert_on_off'):
    """
    根据患者名称获取患者数据(alert_on_off)
    :param patient_name: 患者名称
    :param right_or_left: 右眼或者左眼或者不区分左右眼
    :param on_or_off: 开启或者关闭
    :param src_dir: 数据父文件夹路径，默认为'./data/alert_on_off'
    :return: 患者数据的DataFrame，如果未找到则返回None
    """
    data_dir = src_dir + '/' + right_or_left + '_' + on_or_off
    print(data_dir)
    all_files = os.listdir(data_dir)
    # print(all_files)

    for filename in all_files:
        if patient_name in filename:
            patient_file = os.path.join(data_dir, filename)
            return pd.read_excel(patient_file)

    print(f"未找到患者'{patient_name}'的数据文件")
    return None

def get_all_position_patient_name_dict(data_dir='./data/merged_data.xlsx'):
    """
    获取各个体位的患者名称
    :param data_dir: 数据文件夹路径，默认为'./data/merged_data.xlsx'
    :return: 各个体位的患者名字字典
    """
    df = pd.read_excel(data_dir)

    position_list = df['体位'].unique()
    patient_position_dict = {}

    for position in position_list:
        df_position = df[df['体位'] == position]
        patient_list = df_position['姓名'].unique()
        patient_position_dict[position] = patient_list

    return patient_position_dict


def get_unique_position_patient_name_dict(data_dir='./data/merged_data.xlsx', position_name='面向下'):
    """
    获取某个体位的患者名称
    :param data_dir: 数据文件夹路径，默认为'./data/merged_data.xlsx'
    :param position_name: 体位名称，默认为'面向下'
    :return: 该体位的患者名字列表
    """
    df = pd.read_excel(data_dir)
    df_position = df[df['体位'] == position_name]
    patient_list = df_position['姓名'].unique()

    return patient_list


def get_init_xyz_angles(patient_name, dataframe):
    """
    提取并返回 DataFrame 中初始的xyz三轴的角度
    :param patient_name: 患者名称
    :param dataframe: 包含患者数据的 DataFrame
    :return: 包含患者姓名 x轴角度, y轴角度 和 z轴角度 的 DataFrame
    """
    # 获取初始化三轴角度的内容
    init_xyz_content = dataframe['初始化三轴角度'][0]
    print(init_xyz_content)

    # 使用正则表达式提取 x轴, y轴 和 z轴 角度值
    match = re.search(
        r'x轴:(-?\d+\.?\d*);y轴:(-?\d+\.?\d*);z轴:(-?\d+\.?\d*)', init_xyz_content)
    if match:
        x_angle = float(match.group(1))
        y_angle = float(match.group(2))
        z_angle = float(match.group(3))
    else:
        raise ValueError("无法解析初始化三轴角度的内容")

    # 创建一个字典来存储这些数据
    initial_angles = {
        '患者名称': patient_name,
        'x轴角度': x_angle,
        'y轴角度': y_angle,
        'z轴角度': z_angle
    }

    # 创建一个 DataFrame 来存储这些数据
    initial_angles_df = pd.DataFrame([initial_angles])

    return initial_angles_df


def get_xyz_angles(dataframe):
    """
    提取并返回 DataFrame 中所有的 x轴角度, y轴角度 和 z轴角度 的数值
    :param dataframe: 包含患者数据的 DataFrame
    :return: 包含 x轴角度, y轴角度 和 z轴角度 的 DataFrame
    """
    try:
        xyz_angles = dataframe.loc[:, ['x轴角度', 'y轴角度', 'z轴角度']]
        # Assuming the first row might be a header or unnecessary
        return xyz_angles[1:]
    except KeyError as e:
        print(f"错误：找不到列 {e}")
        return None


def get_xyz_angles_revision(dataframe, diff_x, diff_y, diff_z):
    """
    提取并返回 DataFrame 中所有的修正后的 x轴角度, y轴角度 和 z轴角度 的数值
    :param dataframe: 包含患者数据的 DataFrame
    :param diff_x: 修正x初始值的幅度
    :param diff_y: 修正y初始值的幅度
    :param diff_z: 修正z初始值的幅度
    :return: 包含 x轴角度, y轴角度 和 z轴角度 的 DataFrame
    """
    try:
        xyz_angles = dataframe.loc[:, ['x轴角度', 'y轴角度', 'z轴角度']]
        # 将角度数据转换为 numpy 数组
        angles_array = xyz_angles.to_numpy()
        angle_diff = diff_x, diff_y, diff_z
        # 修正角度，考虑周期性（例如 360 度）
        revised_angles = angles_array + angle_diff

        # 创建修正后的 DataFrame
        revised_df = pd.DataFrame(revised_angles, columns=['x轴角度', 'y轴角度', 'z轴角度'])

        return revised_df[1:]
    except KeyError as e:
        print(f"错误：找不到列 {e}")
        return None
    

def angle_diff(angle1, angle2):
    """
    计算两个角度之间的差异
    :param angle1: 第一个角度
    :param angle2: 第二个角度
    :return: 两个角度之间的差异，单位为角度
    """
    # 将角度转换为弧度
    angle1_rad = np.radians(angle1)
    angle2_rad = np.radians(angle2)

    # 计算两个角度之间的差异
    diff_rad = np.arctan2(np.sin(angle1_rad - angle2_rad), np.cos(angle1_rad - angle2_rad))

    # 将差异转换回角度
    diff_deg = np.degrees(diff_rad)

    return diff_deg


def save_position_data(position, data, output_dir='./data/position_data'):
    """
    保存各个体位的数据到 Excel或者csv 文件，具体保存的格式取决于记录的数量大小
    :param position: 体位名称
    :param data: 包含所有患者数据的 DataFrame
    :param output_dir: 输出文件夹路径，默认为'./data/position_data'
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 根据数据量的大小选择保存的文件格式
    if len(data) > 65536:
        output_file = os.path.join(output_dir, f'{position}.csv')
        data.to_csv(output_file, index=False)    
    else:
        output_file = os.path.join(output_dir, f'{position}.xlsx')
        data.to_excel(output_file, index=False)

    print(f"保存 {position} 数据到 {output_file}")


def map_points_to_sphere(x, y, z):
    """
    将点映射到球面上
    :param x: 点的 x 坐标
    :param y: 点的 y 坐标
    :param z: 点的 z 坐标
    :return: 映射到球面上的 x, y 和 z 坐标
    """

    # 计算点的长度（距离球心的距离）
    lengths = np.sqrt(x**2 + y**2 + z**2)

    # 将点投影到球面上
    x_mapped = x / lengths
    y_mapped = y / lengths
    z_mapped = z / lengths
    return x_mapped, y_mapped, z_mapped
