'''
Utility to categorize patients by affected eye (left/right)
Separates patient data based on eye condition for targeted analysis
'''
import pandas as pd

from utils.get_xyz_value import get_unique_position_patient_name_dict

def split_right_and_left_eye_patient(patient_list, position_name='面向下'):
    """
    将患者列表分为左眼和右眼患者
    :param patient_list: 患者列表
    :param position_name: 体位名称，默认为'面向下'
    :return: 左眼患者列表和右眼患者列表
    """
    left_eye_patient_list = []
    right_eye_patient_list = []

    df = pd.read_excel('./data/merged_data.xlsx')
    df_position = df[df['体位'] == position_name]

    for patient in patient_list:
        patient_row = df_position[df_position['姓名'] == patient]
        if patient_row.empty:
            print(f"未找到患者'{patient}'的数据")
            continue

        eye = patient_row['左右眼'].values[0]
        if eye == 'l':
            left_eye_patient_list.append(patient)
        elif eye == 'r':
            right_eye_patient_list.append(patient)
        else:
            print(f"患者'{patient}'眼睛信息有误")

    return left_eye_patient_list, right_eye_patient_list