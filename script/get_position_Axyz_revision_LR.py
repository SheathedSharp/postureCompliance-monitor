'''
Position analysis for left/right eye patients with revised XYZ calculations
Processes patient posture data for different eye conditions and positions
'''
from utils.get_xyz_value import get_all_position_patient_name_dict, get_patient_detail_data, get_unique_position_patient_name_dict, save_position_data, get_init_xyz_angles, get_xyz_angles_revision, angle_diff
from utils.calculate_xyz_center import calculate_center_vetor
from utils.position_match import translate_position
import pandas as pd

from utils.split_right_and_left_eye_patient import split_right_and_left_eye_patient

FD_patient_list =  get_unique_position_patient_name_dict('./data/merged_data.xlsx', '面向下')
left_eye_patient_list, right_eye_patient_list = split_right_and_left_eye_patient(FD_patient_list, '面向下')

print(f"面向下患者列表: {FD_patient_list}")
print(f"左眼患者列表: {left_eye_patient_list}")
print(f"右眼患者列表: {right_eye_patient_list}")

right_origin_xyz_data_df = pd.read_excel(
    f'./data/position_data/FD_right_origin.xlsx')

left_origin_xyz_data_df = pd.read_excel(
    f'./data/position_data/FD_left_origin.xlsx')

# 调用函数进行计算该体位的中心初始向量
r_revise_x, r_revise_y, r_revise_z = calculate_center_vetor(
    right_origin_xyz_data_df)

l_revise_x, l_revise_y, l_revise_z = calculate_center_vetor(
    left_origin_xyz_data_df)

print(
    f"面向下患者右眼病变的中心向量: x轴角度: {r_revise_x}, y轴角度: {r_revise_y}, z轴角度: {r_revise_z}")
print(
    f"面向下患者左眼病变的中心向量: x轴角度: {l_revise_x}, y轴角度: {l_revise_y}, z轴角度: {l_revise_z}")

all_left_patients_data = []
all_right_patients_data = []


for left_patient_name in left_eye_patient_list:
    print(f'患者：{left_patient_name}')
    patient_data = get_patient_detail_data(left_patient_name)

    if patient_data is not None:
        print("查找成功")
        init_xyz_angle = get_init_xyz_angles(
            left_patient_name, patient_data)
        # 从返回的DataFrame中提取xyz三轴的值
        x_angle = init_xyz_angle['x轴角度'].iloc[0]
        y_angle = init_xyz_angle['y轴角度'].iloc[0]
        z_angle = init_xyz_angle['z轴角度'].iloc[0]

        diff_x = angle_diff(x_angle, l_revise_x)
        diff_y = angle_diff(y_angle, l_revise_y)
        diff_z = angle_diff(z_angle, l_revise_z)
        print(f"x轴修正值: {diff_x}, y轴修正值: {diff_y}, z轴修正值: {diff_z}")

        xyz_angles = get_xyz_angles_revision(
            patient_data, diff_x, diff_y, diff_z)

        if xyz_angles is not None:
            all_left_patients_data.append(xyz_angles)
            print("----------")
        else:
            print("提取角度数据时出错")

    else:
        print("出现错误！！")

if all_left_patients_data:
    position_data = pd.concat(all_left_patients_data, ignore_index=True)
    save_position_data(f'FD_left_revision', position_data)

    
for right_patient_name in right_eye_patient_list:
    print(f'患者：{right_patient_name}')
    patient_data = get_patient_detail_data(right_patient_name)

    if patient_data is not None:
        print("查找成功")
        init_xyz_angle = get_init_xyz_angles(
            right_patient_name, patient_data)
        # 从返回的DataFrame中提取xyz三轴的值
        x_angle = init_xyz_angle['x轴角度'].iloc[0]
        y_angle = init_xyz_angle['y轴角度'].iloc[0]
        z_angle = init_xyz_angle['z轴角度'].iloc[0]

        diff_x = angle_diff(x_angle, r_revise_x)
        diff_y = angle_diff(y_angle, r_revise_y)
        diff_z = angle_diff(z_angle, r_revise_z)
        print(f"x轴修正值: {diff_x}, y轴修正值: {diff_y}, z轴修正值: {diff_z}")

        xyz_angles = get_xyz_angles_revision(
            patient_data, diff_x, diff_y, diff_z)

        if xyz_angles is not None:
            all_right_patients_data.append(xyz_angles)
            print("----------")
        else:
            print("提取角度数据时出错")

    else:
        print("出现错误！！")

if all_right_patients_data:
    position_data = pd.concat(all_right_patients_data, ignore_index=True)
    save_position_data(f'FD_right_revision', position_data)

