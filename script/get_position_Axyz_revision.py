'''
Revised Axyz position analysis script
Processes patient position data with improved calculation methods
'''
from utils.get_xyz_value import get_all_position_patient_name_dict, get_patient_detail_data, save_position_data, get_init_xyz_angles, get_xyz_angles_revision, angle_diff
from utils.calculate_xyz_center import calculate_center_vetor
from utils.position_match import translate_position
import pandas as pd

patient_position_dict = get_all_position_patient_name_dict()

# @需要修改的地方
select_position = '右侧卧位'

for position, patient_list in patient_position_dict.items():
    if position == select_position:
        all_patients_data = []

        position_en = translate_position(position)
        origin_xyz_data_df = pd.read_excel(
            f'./data/position_data/{position_en}_origin.xlsx')

        # 调用函数进行计算该体位的中心初始向量
        revise_x, revise_y, revise_z = calculate_center_vetor(
            origin_xyz_data_df)

        print(
            f"该体位的中心向量: x轴角度: {revise_x}, y轴角度: {revise_y}, z轴角度: {revise_z}")

        for patient_name in patient_list:
            print(f'患者：{patient_name}')
            patient_data = get_patient_detail_data(patient_name)

            if patient_data is not None:
                print("查找成功")
                init_xyz_angle = get_init_xyz_angles(
                    patient_name, patient_data)
                # 从返回的DataFrame中提取xyz三轴的值
                x_angle = init_xyz_angle['x轴角度'].iloc[0]
                y_angle = init_xyz_angle['y轴角度'].iloc[0]
                z_angle = init_xyz_angle['z轴角度'].iloc[0]

                diff_x = angle_diff(x_angle, revise_x)
                diff_y = angle_diff(y_angle, revise_y)
                diff_z = angle_diff(z_angle, revise_z)
                print(f"x轴修正值: {diff_x}, y轴修正值: {diff_y}, z轴修正值: {diff_z}")

                xyz_angles = get_xyz_angles_revision(
                    patient_data, diff_x, diff_y, diff_z)

                if xyz_angles is not None:
                    all_patients_data.append(xyz_angles)
                    print("----------")
                else:
                    print("提取角度数据时出错")

            else:
                print("出现错误！！")

        if all_patients_data:
            position_data = pd.concat(all_patients_data, ignore_index=True)
            save_position_data(f"{position_en}_revision", position_data)
        else:
            print(f"没有 {position} 体位的有效数据")
