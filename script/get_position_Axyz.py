'''
Axyz position analysis script
Processes patient position data for compliance analysis
'''
from utils.get_xyz_value import get_all_position_patient_name_dict, get_patient_detail_data, get_xyz_angles, save_position_data
from utils.position_match import translate_position
import pandas as pd


patient_position_dict = get_all_position_patient_name_dict()

for position, patient_list in patient_position_dict.items():
    print(f'体位：{position}')
    all_patients_data = []

    for patient_name in patient_list:
        print(f'患者：{patient_name}')
        patient_data = get_patient_detail_data(patient_name)

        if patient_data is not None:
            print("查找成功")
            xyz_angles = get_xyz_angles(patient_data)

            if xyz_angles is not None:
                all_patients_data.append(xyz_angles)
            else:
                print("提取角度数据时出错")

        else:
            print("出现错误！！")

    if all_patients_data:
        position_data = pd.concat(all_patients_data, ignore_index=True)
        position_en = translate_position(position)
        save_position_data(position_en, position_data)
    else:
        print(f"没有 {position} 体位的有效数据")

    print()  # 用于分隔不同体位的输出
