'''
Utility to split data into intervention periods
Analyzes temporal patterns in patient compliance intervention data
'''
def split_intervention_periods(df):
    """
    将数据分成干预和非干预时段
    每小时的前30分钟是非干预期，后30分钟是干预期
    返回每个时段的数据列表
    """
    # 一小时有3600个数据点，前1800个是非干预，后1800个是干预
    intervention_periods = []
    non_intervention_periods = []
    
    for hour in range(4):  # 4小时数据
        start_idx = hour * 3600
        mid_idx = start_idx + 1800
        end_idx = start_idx + 3600
        
        # 提取非干预期（前30分钟）
        non_intervention = df[start_idx:mid_idx].copy()
        non_intervention['time'] = range(1800)  # 重置时间为0-1799
        non_intervention['period'] = hour
        # 计算合格率
        non_intervention['合格率'] = non_intervention.apply(
            lambda row: 100.0 if row['time'] < 10 
            else (1 - (non_intervention['警戒'].loc[:row.name] == '是').sum() / (row.name + 1)) * 100,
            axis=1
        )
        non_intervention_periods.append(non_intervention)
        
        # 提取干预期（后30分钟）
        intervention = df[mid_idx:end_idx].copy()
        intervention['time'] = range(1800)  # 重置时间为0-1799
        intervention['period'] = hour
        # 计算合格率
        intervention['合格率'] = intervention.apply(
            lambda row: 100.0 if row['time'] < 10 
            else (1 - (intervention['警戒'].loc[:row.name] == '是').sum() / (row.name + 1)) * 100,
            axis=1
        )
        intervention_periods.append(intervention)
    
    return non_intervention_periods, intervention_periods