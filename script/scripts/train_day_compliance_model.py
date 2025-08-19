import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import r2_score
import matplotlib.pyplot as plt
import numpy as np
from model.quadratic import QuadraticModel
from utils.read_origin_data import read_origin_data
from utils.split_intervention_periods import split_intervention_periods
from utils.draw_plot import compliance_with_intervention_plot
import copy


def evaluate_model(model, test_features_list, test_labels_list):
    """
    评估模型性能
    """
    total_r2 = 0
    total_loss = 0
    criterion = nn.MSELoss()
    
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

                y_true = y_test.numpy().flatten()
                y_pred = test_predictions.numpy().flatten()
                r2 = r2_score(y_true, y_pred)
                
                patient_loss += test_loss.item()
                patient_r2 += r2
                period_count += 1
            
            if period_count > 0:
                total_loss += patient_loss / period_count
                total_r2 += patient_r2 / period_count
    
    num_patients = len(test_patient_data)
    avg_test_loss = total_loss / num_patients if num_patients > 0 else 0
    avg_r2 = total_r2 / num_patients if num_patients > 0 else 0
    
    return avg_test_loss, avg_r2


def train_compliance_model(train_features_list, train_labels_list, test_features_list, test_labels_list):
    """
    训练日间患者的依从性预测模型，使用二次多项式模型
    """
    model = QuadraticModel()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.002)

    # 按患者组织训练数据
    patient_data = {}
    for idx, features_dict in enumerate(train_features_list):
        patient = features_dict['patient']
        period = features_dict['period']
        X = features_dict['time'].reshape(-1, 1) / 1800.0  # 归一化时间特征
        y = train_labels_list[idx].reshape(-1, 1)

        if patient not in patient_data:
            patient_data[patient] = {}
        patient_data[patient][period] = (
            torch.FloatTensor(X), torch.FloatTensor(y))

    # 训练过程
    num_epochs = 3000
    best_loss = float('inf')
    patience = 200
    no_improve = 0
    best_model = None

    for epoch in range(num_epochs):
        model.train()
        epoch_loss = 0
        patient_count = 0

        # 随机打乱患者顺序
        patients = list(patient_data.keys())
        np.random.shuffle(patients)

        for patient in patients:
            patient_loss = 0
            period_count = 0

            for period in range(4):
                if period not in patient_data[patient]:
                    continue

                X, y = patient_data[patient][period]
                optimizer.zero_grad()
                outputs = model(X)
                loss = criterion(outputs, y)
                loss.backward()

                # 梯度裁剪
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                
                optimizer.step()

                # 参数约束
                with torch.no_grad():
                    model.a.clamp_(99.99, 99.9999)      # 稳定值范围
                    model.b.clamp_(-2, -1.33)       # 一次项系数（负值，表示下降趋势）
                    model.c.clamp_(-3, -2) # 二次项系数（很小的负值，确保适度的曲率）

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

        if (epoch + 1) % 50 == 0:
            print(
                f'Epoch [{epoch+1}/{num_epochs}], Average Loss: {avg_loss:.4f}')
            print(f'Current formula: y = {model.get_formula()}')

    # 使用最佳模型进行评估
    model = best_model
    model.eval()
    test_loss, test_r2 = evaluate_model(model, test_features_list, test_labels_list)

    print("\nFinal fitted formula:")
    print(f"y = {model.get_formula()}")
    print(f"Test Loss: {test_loss:.4f}, R² Score: {test_r2:.4f}")

    return model, best_loss, test_r2


def analyze_intervention_effect():
    """
    分析干预效果
    """
    # 读取数据
    day_train_data, day_test_data = read_origin_data(night=False)

    # 分别处理每个患者的数据
    day_train_features = []
    day_train_labels = []
    day_test_features = []
    day_test_labels = []

    # 处理日间训练集患者
    for patient_df in day_train_data:
        _, intervention_periods = split_intervention_periods(patient_df)
        # 对每个干预时段分别添加
        for period_df in intervention_periods:
            features_dict = {
                'time': period_df['time'].values,
                'period': period_df['period'].iloc[0],
                'patient': period_df['patient'].iloc[0]
            }
            day_train_features.append(features_dict)
            day_train_labels.append(period_df['合格率'].values)

    # 处理日间测试集患者
    for patient_df in day_test_data:
        _, intervention_periods = split_intervention_periods(patient_df)
        for period in intervention_periods:
            features_dict = {
                'time': period['time'].values,
                'period': period['period'].iloc[0],
                'patient': period['patient'].iloc[0]
            }
            day_test_features.append(features_dict)
            day_test_labels.append(period['合格率'].values)

    # 训练模型
    print("Training day intervention model...")
    day_intervention_model, day_loss, day_r2 = train_compliance_model(
        day_train_features,
        day_train_labels,
        day_test_features,
        day_test_labels
    )

    # 绘制结果
    compliance_with_intervention_plot(day_intervention_model,
                                     day_test_features, day_test_labels,
                                     day_r2)


if __name__ == '__main__':
    # 运行分析
    analyze_intervention_effect()
