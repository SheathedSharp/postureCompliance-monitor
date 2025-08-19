'''
Position matching utility for translating position names
Converts between Chinese and English position terminology
'''
def translate_position(position_chinese):
    # 定义中文名称到英文简称的映射
    position_mapping = {
        "面向下": "FD",  # Face Down
        "半坐卧位": "SS",  # Semi-Sitting
        "右侧卧位": "RL",  # Right Lateral
        "左侧卧位": "LL"   # Left Lateral
    }
    
    # 返回对应的英文简称，如果没有找到，返回'Unknown'
    return position_mapping.get(position_chinese, "Unknown")

# # 测试函数
# print(translate_position("面向下"))  # 输出：FD
# print(translate_position("半坐卧位"))  # 输出：SS
# print(translate_position("右侧卧位"))  # 输出：RL
# print(translate_position("左侧卧位"))  # 输出：LL
# print(translate_position("未知位置"))  # 输出：Unknown