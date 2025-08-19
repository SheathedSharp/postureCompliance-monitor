'''
Utility function to extract patient names from file paths
Handles file path parsing for patient data organization
'''
import re

def get_patient_name_from_path(file_path):
    """
    从文件路径中获取患者名字
    :param file_path: 文件路径
    :return: 患者名字
    """
    pattern = re.compile(r'[\u4e00-\u9fa5]+')
    patient_name = pattern.findall(file_path)[0]
    return patient_name
