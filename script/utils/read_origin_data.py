'''
Utility functions for reading and processing patient origin data
Handles Excel files with patient posture measurements and compliance data
'''
import pandas as pd
import numpy as np
import glob
from utils.get_patient_name_from_path import get_patient_name_from_path
from config import DATA_DIR, DATA_PROCESSING, ROOT_DIR


def read_night_patient_start_caculate_time(patient_name):
    """
    读取夜间患者记录的计算起始时间
    :param patient_name: 患者名字
    :return: 从记录开始的第几个小时开始计算
    """
    # 读取夜间患者的记录起始时间
    file_path = ROOT_DIR / 'data' / 'orginal_data.xlsx'
    df = pd.read_excel(file_path, sheet_name='夜间')

    patient_row = df[df['姓名'] == patient_name]
    start_hour = patient_row['计算起始(h)']
    return start_hour.values[0]


def read_origin_data(night=False):
    """
    读取日间或者夜间所有患者的记录，并按患者划分训练集和测试集
    :param night: 是否为夜间患者
    :return: (train_data, test_data) 训练集和测试集的dataframe列表
    """
    # 读取所有患者数据
    if night:
        file_path = DATA_DIR['night_origin']
    else:
        file_path = DATA_DIR['day_origin']
    file_paths = glob.glob(f'{file_path}/*.xlsx')
    
    # 随机划分患者
    np.random.seed(DATA_PROCESSING['random_seed'])
    test_size = int(len(file_paths) * DATA_PROCESSING['test_ratio'])
    test_files = np.random.choice(file_paths, size=test_size, replace=False)
    train_files = [f for f in file_paths if f not in test_files]
    
    train_data = []
    test_data = []

    # 处理训练集患者
    for file_path in train_files:
        df = pd.read_excel(file_path)
        columns = df.columns[:7]
        df_1 = df[columns]
        df_1 = df_1[1:]  # 跳过第一行
        
        if night:
            patient_name = get_patient_name_from_path(file_path)
            start_hour = read_night_patient_start_caculate_time(patient_name)
            start_index = start_hour*60*60
            df_1 = df_1[start_index:start_index+21600].reset_index(drop=True)
        else:
            df_1 = df_1[:21600]
            
        df_1['patient'] = get_patient_name_from_path(file_path)  # 添加患者标识
        train_data.append(df_1)

    # 处理测试集患者
    for file_path in test_files:
        df = pd.read_excel(file_path)
        columns = df.columns[:7]
        df_1 = df[columns]
        df_1 = df_1[1:]
        
        if night:
            patient_name = get_patient_name_from_path(file_path)
            start_hour = read_night_patient_start_caculate_time(patient_name)
            start_index = start_hour*60*60
            df_1 = df_1[start_index:start_index+21600].reset_index(drop=True)
        else:
            df_1 = df_1[:21600]
            
        df_1['patient'] = get_patient_name_from_path(file_path)  # 添加患者标识
        test_data.append(df_1)

    print(f"训练集患者数量: {len(train_files)}")
    print(f"测试集患者数量: {len(test_files)}")
    
    return train_data, test_data

