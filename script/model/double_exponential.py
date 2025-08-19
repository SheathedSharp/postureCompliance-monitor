'''
Double exponential decay model for patient compliance prediction
PyTorch implementation for complex compliance behavior modeling
'''
import torch
import torch.nn as nn

class DoubleExponentialModel(nn.Module):
    def __init__(self):
        """
        双指数衰减模型: y = a + b1 * exp(-c1*x) + b2 * exp(-c2*x)
        """
        super(DoubleExponentialModel, self).__init__()
        self.a = nn.Parameter(torch.tensor(96.80))  # 稳定值
        self.b1 = nn.Parameter(torch.tensor(2.00))  # 第一个指数项幅度
        self.c1 = nn.Parameter(torch.tensor(0.001))  # 第一个衰减率
        self.b2 = nn.Parameter(torch.tensor(1.00))  # 第二个指数项幅度
        self.c2 = nn.Parameter(torch.tensor(0.01))  # 第二个衰减率

    def forward(self, x):
        real_time = x * 1800  # 还原真实时间
        return self.a + self.b1 * torch.exp(-self.c1 * real_time) + self.b2 * torch.exp(-self.c2 * real_time)

    def get_formula(self):
        return f"{self.a.item():.4f} + {self.b1.item():.4f} * exp(-{self.c1.item():.6f}x) + {self.b2.item():.4f} * exp(-{self.c2.item():.6f}x)"