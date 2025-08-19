'''
Quadratic model for patient compliance prediction
PyTorch implementation for polynomial compliance behavior modeling
'''
import torch
import torch.nn as nn

class QuadraticModel(nn.Module):
    def __init__(self):
        super(QuadraticModel, self).__init__()
        # 初始化参数
        self.a = nn.Parameter(torch.tensor(99.99))  # 截距
        self.b = nn.Parameter(torch.tensor(0.0))  # 一次项系数
        self.c = nn.Parameter(torch.tensor(-0.00001))  # 二次项系数（初始值很小）

    def forward(self, x):
        return self.a + self.b * x + self.c * x**2

    def get_formula(self):
        # 使用.item()将Parameter转换为Python标量
        return f"{self.a.item():.2f} + {self.b.item():.4f}x + {self.c.item():.6f}x²"