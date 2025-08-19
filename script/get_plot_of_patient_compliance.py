'''
Patient compliance plotting and analysis script
Generates visualizations and statistical analysis of patient compliance data
'''
import pandas as pd
import matplotlib.pyplot as plt
import glob
import numpy as np
from scipy.optimize import curve_fit
import math
import re
from utils.get_patient_name_from_path import get_patient_name_from_path

def read_night_patient_start_caculate_time(patient_name):
    """
    读取夜间患者记录的计算起始时间
    :param patient_name: 患者名字
    :return: 从记录开始的第几个小时开始计算
    """
    # 读取夜间患者的记录起始时间
    file_paths = './data/orginal_data.xlsx'
    df = pd.read_excel(file_paths, sheet_name='夜间')

    patient_row = df[df['姓名'] == patient_name]
    start_hour = patient_row['计算起始(h)']
    return start_hour.values[0]

def read_origin_data(file_path, night=False):
    """
    读取路径文件夹下所有患者的记录
    :param file_path: 文件夹的路径
    :param night: 是否为夜间患者
    :return 合并后的dataframe
    """
    # 读取所有患者数据
    file_paths = glob.glob(f'{file_path}/*.xlsx')
    all_data = []

    for file_path in file_paths:
        df = pd.read_excel(file_path)
        columns = df.columns[:7]
        df_1 = df[columns]
        df_1 = df_1[1:]  # 跳过第一行
        
        if night:
            patient_name = get_patient_name_from_path(file_path)
            start_hour = read_night_patient_start_caculate_time(patient_name)

            # 计算从哪个时间点开始计算
            start_index = start_hour*60*60
            
            df_1 = df_1[start_index:start_index+21600].reset_index(drop=True)
            df_1['合格率'] = 100.0  # 初始合格率为100%
            df_1['合格率'] = (1 - (df_1['警戒'] == '是').cumsum() / (df_1.index + 1)) * 100
        else:
            df_1 = df_1[:21600]
            df_1['合格率'] = 100.0  # 初始合格率为100%
            df_1['合格率'] = (1 - (df_1['警戒'] == '是').cumsum() / (df_1.index + 1)) * 100

        all_data.append(df_1)

    return all_data

def poly(poly):
    coefficients = poly.c  # 获取多项式的系数

    # 构造多项式字符串
    poly_str = 'y = '
    for i, coef in enumerate(coefficients):
        power = len(coefficients) - i - 1
        if power == 0:
            poly_str += f'{coef}'
        else:
            poly_str += f'{coef}x^{power} + '

    # 去掉最后的 ' + '
    poly_str = poly_str.rstrip(' + ')

    print(poly_str)




    return 

def patient_compliance_with_Intervention():
    """
    受干预患者依从性
    
    """
    day_all_data = read_origin_data('./data/day_origin_data')
    night_all_data = read_origin_data('./data/night_origin_data', night=True)

    # 合并所有数据
    day_combined_data = pd.concat(day_all_data)
    night_combined_data = pd.concat(night_all_data)

    # 按时间点计算平均合格率和标准误
    day_avg_qualified_rate = day_combined_data.groupby(day_combined_data.index)['合格率'].mean()
    day_sem_qualified_rate = day_combined_data.groupby(day_combined_data.index)['合格率'].sem()
    night_avg_qualified_rate = night_combined_data.groupby(night_combined_data.index)['合格率'].mean()
    night_sem_qualified_rate = night_combined_data.groupby(night_combined_data.index)['合格率'].sem()


    # 绘制图形
    plt.figure(figsize=(12, 6))

    day_time_points = day_avg_qualified_rate.index
    day_avg_rate_values = day_avg_qualified_rate.values
    day_sem_rate_values = day_sem_qualified_rate.values

    night_time_points = night_avg_qualified_rate.index
    night_avg_rate_values = night_avg_qualified_rate.values
    night_sem_rate_values = night_sem_qualified_rate.values

    # 日间合格率和拟合曲线
    plt.plot(day_time_points, day_avg_rate_values, linestyle='-', linewidth=1.5, color='#C25759', label='Average compliance of day patients')

    # 夜间合格率和拟合曲线
    plt.plot(night_time_points, night_avg_rate_values, linestyle='-', linewidth=1.5, color='#599CB4', label='Average compliance of night patients')

    # 填充SEM区间
    plt.fill_between(day_time_points, day_avg_rate_values - day_sem_rate_values, day_avg_rate_values + day_sem_rate_values, color='#F5DFDB', alpha=0.2, label='The numerical oscillation range of the average adherence curve for daytime patients(SEM)')
    plt.fill_between(night_time_points, night_avg_rate_values - night_sem_rate_values, night_avg_rate_values + night_sem_rate_values, color='#CCE4EF', alpha=0.2, label='The numerical oscillation range of the average adherence curve for nighttime patients(SEM)')


    # 定义时间点刻度
    x_index = list(range(0, 21601, 3600))
    x_labels = [str(i // 3600) for i in x_index]

    hours_columns_index = list(range(0, 21601, 1800))
    # 循环添加虚线
    for i in hours_columns_index:
        plt.axvline(x=i, color='k', linestyle='--', alpha=0.1)

    plt.xticks(x_index, x_labels)
    # 设置图形的标题和标签
    plt.title('Graph of the change of average compliance of intervention patients with time')
    plt.xlabel('Hours')
    plt.ylabel('compliance(%)')
    plt.legend()

    # 显示图形
    plt.grid(False)
    plt.tight_layout()
    plt.show()


def patient_compliance_without_Intervention():
    """
    不受干预患者依从性
    
    """
    day_all_data = read_origin_data('./data/day_origin_data')
    night_all_data = read_origin_data('./data/night_origin_data', night=True)

    # 合并所有数据
    day_combined_data = pd.concat(day_all_data)
    night_combined_data = pd.concat(night_all_data)

    # 按时间点计算平均合格率和标准误
    day_avg_qualified_rate = day_combined_data.groupby(day_combined_data.index)['合格率'].mean()
    day_sem_qualified_rate = day_combined_data.groupby(day_combined_data.index)['合格率'].sem()
    night_avg_qualified_rate = night_combined_data.groupby(night_combined_data.index)['合格率'].mean()
    night_sem_qualified_rate = night_combined_data.groupby(night_combined_data.index)['合格率'].sem()


    # 绘制图形
    plt.figure(figsize=(12, 6))

    max_points = 1800

    day_time_points = day_avg_qualified_rate.index[:max_points]
    day_avg_rate_values = day_avg_qualified_rate.values[:max_points]
    day_sem_rate_values = day_sem_qualified_rate.values[:max_points]

    night_time_points = night_avg_qualified_rate.index[:max_points]
    night_avg_rate_values = night_avg_qualified_rate.values[:max_points]
    night_sem_rate_values = night_sem_qualified_rate.values[:max_points]

    # 日间患者依从性曲线
    plt.plot(day_time_points, day_avg_rate_values, linestyle='-', linewidth=1.5, color='#C25759', label='Average compliance of day patients')

    # 夜间患者依从性曲线
    plt.plot(night_time_points, night_avg_rate_values, linestyle='-', linewidth=1.5, color='#599CB4', label='Average compliance of night patients')

    def complex_decay_function(x, a1, b1, a2, b2, a3, b3, c, d, e, f):
        return a1 * np.exp(-b1 * x) + a2 * np.exp(-b2 * x) + a3 * np.log(b3 * x + 1) + c * np.sin(d * x) + e * np.tanh(f * x) + 50

    # Fit the complex decay function to the data
    bounds = ([0, 0, 0, 0, -100, 0, -10, 0, -50, 0], 
              [100, 0.001, 100, 0.001, 100, 100, 10, 0.1, 50, 0.001])  # Lower and upper bounds
    day_popt, _ = curve_fit(complex_decay_function, day_time_points, day_avg_rate_values, 
                            p0=[70, 0.0001, 20, 0.00001, 10, 1, 1, 0.001, -5, 0.0001], 
                            bounds=bounds, maxfev=100000)
    night_popt, _ = curve_fit(complex_decay_function, night_time_points, night_avg_rate_values, 
                              p0=[70, 0.0001, 20, 0.00001, 10, 1, 1, 0.001, -5, 0.0001], 
                              bounds=bounds, maxfev=100000)

    # Calculate R-squared values
    day_r_squared = 1 - np.sum((day_avg_rate_values - complex_decay_function(day_time_points, *day_popt))**2) / np.sum((day_avg_rate_values - np.mean(day_avg_rate_values))**2)
    night_r_squared = 1 - np.sum((night_avg_rate_values - complex_decay_function(night_time_points, *night_popt))**2) / np.sum((night_avg_rate_values - np.mean(night_avg_rate_values))**2)

    print("Day fitting formula:")
    print(f"y = {day_popt[0]:.2f} * exp(-{day_popt[1]:.6f} * x) + "

          f"{day_popt[2]:.2f} * exp(-{day_popt[3]:.6f} * x) + "
          f"{day_popt[4]:.2f} * log({day_popt[5]:.2f} * x + 1) + "
          f"{day_popt[6]:.2f} * sin({day_popt[7]:.6f} * x) + "
          f"{day_popt[8]:.2f} * tanh({day_popt[9]:.6f} * x) + 50")
    print(f"R^2: {day_r_squared:.6f}")

    print("\nNight fitting formula:")
    print(f"y = {night_popt[0]:.2f} * exp(-{night_popt[1]:.6f} * x) + "
          f"{night_popt[2]:.2f} * exp(-{night_popt[3]:.6f} * x) + "
          f"{night_popt[4]:.2f} * log({night_popt[5]:.2f} * x + 1) + "
          f"{night_popt[6]:.2f} * sin({night_popt[7]:.6f} * x) + "
          f"{night_popt[8]:.2f} * tanh({night_popt[9]:.6f} * x) + 50")
    print(f"R^2: {night_r_squared:.6f}")

    # Day and night patient compliance fitting curves
    plt.plot(day_time_points, complex_decay_function(day_time_points, *day_popt), linestyle='--', linewidth=1.5, color='#E69191', label='Fitted curve of compliance for daytime patients')
    plt.plot(night_time_points, complex_decay_function(night_time_points, *night_popt), linestyle='--', linewidth=1.5, color='#92B5CA', label='Fitted curve of compliance for nighttime patients')

    # Calculate values at x=1800 and x=21600
    for x_value in [1800, 21600]:
        day_value_at_x = complex_decay_function(x_value, *day_popt)
        night_value_at_x = complex_decay_function(x_value, *night_popt)
        print(f"\nDay value at x={x_value}: {day_value_at_x:.2f}")
        print(f"Night value at x={x_value}: {night_value_at_x:.2f}")

    # 填充SEM区间
    plt.fill_between(day_time_points, day_avg_rate_values - day_sem_rate_values, day_avg_rate_values + day_sem_rate_values, color='#F5DFDB', alpha=0.2, label='The numerical oscillation range of the average adherence curve for daytime patients(SEM)')
    plt.fill_between(night_time_points, night_avg_rate_values - night_sem_rate_values, night_avg_rate_values + night_sem_rate_values, color='#CCE4EF', alpha=0.2, label='The numerical oscillation range of the average adherence curve for nighttime patients(SEM)')

    # 定义时间点刻度
    x_index = list(range(0, 1801, 120))
    x_labels = [str(i) for i in x_index]

    # 循环添加虚线
    for i in x_index:
        plt.axvline(x=i, color='k', linestyle='--', alpha=0.1)

    plt.xticks(x_index, x_labels)
    # 设置图形的标题和标签
    plt.title('Graph of the change of average compliance of non-intervention patients with time')
    plt.xlabel('Seconds')
    plt.ylabel('compliance(%)')
    plt.legend()

    # 显示图形
    plt.grid(False)
    plt.tight_layout()
    plt.show()



# 受干预患者依从性
# patient_compliance_with_Intervention()

# 不受干预患者依从性
patient_compliance_without_Intervention()