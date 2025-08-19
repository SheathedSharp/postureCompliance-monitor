'''
Single exponential decay model for patient compliance prediction
PyTorch implementation for modeling compliance behavior over time
'''
import torch
import torch.nn as nn

class SingleExponentialModel(nn.Module):
    def __init__(self):
        """
        单指数衰减模型: y = a + b * exp(-c*x)
        a: 最终稳定值 (约97)
        b: 指数项的初始幅度 (约3，使初始值为100)
        c: 衰减率
        """
        super(SingleExponentialModel, self).__init__()
        # 参数初始化
        self.a = nn.Parameter(torch.tensor(96.80))  # 稳定值
        self.b = nn.Parameter(torch.tensor(3.00))   # 指数项幅度
        self.c = nn.Parameter(torch.tensor(0.0007))  # 衰减率
    
    def forward(self, x):
        """
        计算单指数衰减值
        """
        real_time = x * 1800  # 还原真实时间
        return self.a + self.b * torch.exp(-self.c * real_time)
    
    def get_formula(self):
        """
        返回拟合的单指数函数公式
        """
        return f"{self.a.item():.4f} + {self.b.item():.4f} * exp(-{self.c.item():.6f}x)"