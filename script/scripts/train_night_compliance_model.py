import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt
import numpy as np
from utils.split_intervention_periods import split_intervention_periods
from utils.read_origin_data import read_origin_data
from sklearn.metrics import r2_score
from model.triple_exponential import TripleExponentialModel
from utils.draw_plot import compliance_with_intervention_plot
import copy

def train_compliance_model(train_features_list, train_labels_list, test_features_list, test_labels_list):
    """
    训练依从性预测模型，对每个患者的每段数据单独训练
    :param train_features_list: 列表，每个元素是一个字典，包含time, period, patient信息
    :param train_labels_list: 列表，每个元素是对应的合格率数据
    :param test_features_list: 测试集特征列表
    :param test_labels_list: 测试集标签列表
    """
    model = TripleExponentialModel()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 按患者组织训练数据
    patient_data = {}
    for idx, features_dict in enumerate(train_features_list):
        patient = features_dict['patient']
        period = features_dict['period']
        X = features_dict['time'].reshape(-1, 1) / 1800.0  # 归一化时间特征
        y = train_labels_list[idx].reshape(-1, 1)
        
        if patient not in patient_data:
            patient_data[patient] = {}
        patient_data[patient][period] = (torch.FloatTensor(X), torch.FloatTensor(y))

    # 训练过程
    num_epochs = 5000  # 增加训练轮数
    best_loss = float('inf')
    patience = 1000  # 早停耐心值
    no_improve = 0
    best_model = None
    
    for epoch in range(num_epochs):
        model.train()
        epoch_loss = 0
        patient_count = 0
        
        # 随机打乱患者顺序
        patients = list(patient_data.keys())
        np.random.shuffle(patients)
        
        # 对每个患者训练
        for patient in patients:
            patient_loss = 0
            period_count = 0
            
            # 对该患者的每个时间段训练
            for period in range(4):
                if period not in patient_data[patient]:
                    continue
                    
                X, y = patient_data[patient][period]
                
                # 直接使用完整的时间段数据训练
                optimizer.zero_grad()
                outputs = model(X)
                loss = criterion(outputs, y)
                loss.backward()
                
                # 梯度裁剪
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                
                optimizer.step()
                
                # 在优化器步骤后添加参数约束
                with torch.no_grad():
                    model.a.clamp_(96.2, 97.0)      # 稳定值范围
                    model.b.clamp_(0.5, 1.5)        # 第一个指数项幅度
                    model.c1.clamp_(0.0005, 0.002)  # 第一个衰减率（慢）
                    model.d.clamp_(0.5, 1.5)        # 第二个指数项幅度
                    model.c2.clamp_(0.002, 0.008)   # 第二个衰减率（中）
                    model.e.clamp_(0.5, 1.5)        # 第三个指数项幅度
                    model.c3.clamp_(0.008, 0.02)    # 第三个衰减率（快）
                    
                    # 确保衰减率的大小关系：c1 < c2 < c3
                    c1, c2, c3 = model.c1.item(), model.c2.item(), model.c3.item()
                    if not (c1 < c2 < c3):
                        sorted_c = sorted([c1, c2, c3])
                        model.c1.data = torch.tensor(sorted_c[0])
                        model.c2.data = torch.tensor(sorted_c[1])
                        model.c3.data = torch.tensor(sorted_c[2])
                    
                    # 确保初始值接近100
                    total_amplitude = model.b + model.d + model.e
                    if total_amplitude > 3.0:
                        scale = 3.0 / total_amplitude
                        model.b.data *= scale
                        model.d.data *= scale
                        model.e.data *= scale
                
                patient_loss += loss.item()
                period_count += 1
            
            if period_count > 0:
                epoch_loss += patient_loss / period_count
                patient_count += 1
        
        avg_loss = epoch_loss / patient_count if patient_count > 0 else 0
        
        # 早停检查
        if avg_loss < best_loss:
            best_loss = avg_loss
            best_model = copy.deepcopy(model)
            no_improve = 0
        else:
            no_improve += 1
            
        if no_improve >= patience:
            print(f'Early stopping at epoch {epoch+1}')
            break
        
        # 每50个epoch打印一次训练损失
        if (epoch + 1) % 50 == 0:
            print(f'Epoch [{epoch+1}/{num_epochs}], Average Loss: {avg_loss:.4f}')
            print(f'Current formula: y = {model.get_formula()}')

    # 使用最佳模型进行评估
    model = best_model
    model.eval()
    total_r2 = 0
    total_loss = 0
    
    # 按患者组织测试数据
    test_patient_data = {}
    for idx, features_dict in enumerate(test_features_list):
        patient = features_dict['patient']
        period = features_dict['period']
        X = features_dict['time'].reshape(-1, 1) / 1800.0
        y = test_labels_list[idx].reshape(-1, 1)
        
        if patient not in test_patient_data:
            test_patient_data[patient] = {}
        test_patient_data[patient][period] = (torch.FloatTensor(X), torch.FloatTensor(y))
    
    with torch.no_grad():
        # 对每个测试患者评估
        for patient in test_patient_data:
            patient_r2 = 0
            patient_loss = 0
            period_count = 0
            
            # 评估该患者的每个时间段
            for period in range(4):
                if period not in test_patient_data[patient]:
                    continue
                    
                X_test, y_test = test_patient_data[patient][period]
                test_predictions = model(X_test)
                test_loss = criterion(test_predictions, y_test)

                y_true = y_test.numpy().flatten()  # 展平数组
                y_pred = test_predictions.numpy().flatten()  # 展平数组
                r2 = r2_score(y_true, y_pred)
                
                patient_loss += test_loss.item()
                patient_r2 += r2
                period_count += 1
            
            if period_count > 0:
                total_loss += patient_loss / period_count
                total_r2 += patient_r2 / period_count
    
    # 计算所有患者的平均指标
    num_patients = len(test_patient_data)
    avg_test_loss = total_loss / num_patients if num_patients > 0 else 0
    avg_r2 = total_r2 / num_patients if num_patients > 0 else 0
    
    # 打印最终的拟合公式
    print("\nFinal fitted formula:")
    print(f"y = {model.get_formula()}")
    
    return model, avg_test_loss, avg_r2

def analyze_intervention_effect():
    """
    分析干预效果
    """
    # 读取数据
    night_train_data, night_test_data = read_origin_data(night=True)
   
    # 处理夜间患者数据
    night_train_features = []
    night_train_labels = []
    night_test_features = []
    night_test_labels = []
    
    for patient_df in night_train_data:
        _, intervention_periods = split_intervention_periods(patient_df)
        for period in intervention_periods:
            features_dict = {
                'time': period['time'].values,
                'period': period['period'].iloc[0],
                'patient': period['patient'].iloc[0]
            }
            night_train_features.append(features_dict)
            night_train_labels.append(period['合格率'].values)
    
    for patient_df in night_test_data:
        _, intervention_periods = split_intervention_periods(patient_df)
        for period in intervention_periods:
            features_dict = {
                'time': period['time'].values,
                'period': period['period'].iloc[0],
                'patient': period['patient'].iloc[0]
            }
            night_test_features.append(features_dict)
            night_test_labels.append(period['合格率'].values)
    
    print("Training night intervention model...")
    night_intervention_model, night_loss, night_r2 = train_compliance_model(
        night_train_features,
        night_train_labels,
        night_test_features,
        night_test_labels
    )
    
    
    # 绘制结果
    compliance_with_intervention_plot(night_intervention_model, night_test_features, night_test_labels, night_r2)


if __name__ == '__main__':
    # 运行分析
    analyze_intervention_effect()
