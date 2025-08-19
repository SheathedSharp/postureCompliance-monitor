'''
Oxyz position analysis for left/right eye patients
Processes patient position data for different eye conditions
'''
from utils.get_xyz_value import get_unique_position_patient_name_dict
from utils.split_right_and_left_eye_patient import split_right_and_left_eye_patient
from utils.get_xyz_value import get_patient_detail_data, get_init_xyz_angles
from utils.get_xyz_value import save_position_data

import pandas as pd

FD_patient_list =  get_unique_position_patient_name_dict('./data/merged_data.xlsx', '面向下')
left_eye_patient_list, right_eye_patient_list = split_right_and_left_eye_patient(FD_patient_list, '面向下')

print(f"面向下患者列表: {FD_patient_list}")
print(f"左眼患者列表: {left_eye_patient_list}")
print(f"右眼患者列表: {right_eye_patient_list}")


all_left_patients_data = []
all_right_patients_data = []

for left_patient_name in left_eye_patient_list:
    print(f'患者：{left_patient_name}')
    patient_data = get_patient_detail_data(left_patient_name)
    
    if patient_data is not None:    
        print("查找成功")
        init_xyz_angle = get_init_xyz_angles(left_patient_name, patient_data)
        all_left_patients_data.append(init_xyz_angle)

    else:
        print("出现错误！！")

if all_left_patients_data:
    position_data = pd.concat(all_left_patients_data, ignore_index=True)
    save_position_data(f'FD_left_origin', position_data)


for right_patient_name in right_eye_patient_list:
    print(f'患者：{right_patient_name}')
    patient_data = get_patient_detail_data(right_patient_name)
    
    if patient_data is not None:    
        print("查找成功")
        init_xyz_angle = get_init_xyz_angles(right_patient_name, patient_data)
        all_right_patients_data.append(init_xyz_angle)

    else:
        print("出现错误！！")

if all_right_patients_data:
    position_data = pd.concat(all_right_patients_data, ignore_index=True)
    save_position_data(f'FD_right_origin', position_data)