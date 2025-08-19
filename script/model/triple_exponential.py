'''
Triple exponential decay model for patient compliance prediction
PyTorch implementation for advanced compliance behavior modeling
'''
import torch
import torch.nn as nn

class TripleExponentialModel(nn.Module):
    def __init__(self):
        """
        三指数衰减模型: y = a + b * exp(-c1*x) + d * exp(-c2*x) + e * exp(-c3*x)
        a: 最终稳定值 (96.7-97.5)
        b, d, e: 三个指数项的初始幅度 (总和约为3，使初始值为100)
        c1, c2, c3: 三个不同的衰减率 (c1 < c2 < c3，表示快中慢三种衰减)
        """
        super(TripleExponentialModel, self).__init__()
        # 参数初始化
        self.a = nn.Parameter(torch.tensor(97.00))    # 稳定值
        self.b = nn.Parameter(torch.tensor(1.0))      # 第一个指数项的幅度
        self.c1 = nn.Parameter(torch.tensor(0.001))   # 第一个衰减率（慢衰减）
        self.d = nn.Parameter(torch.tensor(1.0))      # 第二个指数项的幅度
        self.c2 = nn.Parameter(torch.tensor(0.005))   # 第二个衰减率（中等衰减）
        self.e = nn.Parameter(torch.tensor(1.0))      # 第三个指数项的幅度
        self.c3 = nn.Parameter(torch.tensor(0.01))    # 第三个衰减率（快衰减）
    
    def forward(self, x):
        """
        计算三指数衰减值
        """
        real_time = x * 1800  # 还原真实时间
        return (self.a + 
                self.b * torch.exp(-self.c1 * real_time) + 
                self.d * torch.exp(-self.c2 * real_time) + 
                self.e * torch.exp(-self.c3 * real_time))
    
    def get_formula(self):
        """
        返回拟合的三指数函数公式
        """
        return (f"{self.a.item():.4f} + "
                f"{self.b.item():.4f} * exp(-{self.c1.item():.6f}x) + "
                f"{self.d.item():.4f} * exp(-{self.c2.item():.6f}x) + "
                f"{self.e.item():.4f} * exp(-{self.c3.item():.6f}x)")

