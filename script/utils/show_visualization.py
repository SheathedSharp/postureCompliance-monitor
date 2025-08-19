'''
Visualization utilities for patient data display
Tkinter-based GUI components for data visualization and analysis
'''
import tkinter as tk
from tkinter import filedialog
import os



# 显示可视化页面，让用户选择需要读取的文档
def show_visualization():
    # 获取当前文件的目录路径
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 默认打开当前目录
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(initialdir=current_dir)
    
    return file_path