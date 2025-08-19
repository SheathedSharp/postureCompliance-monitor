# 一路启明-视网膜脱落康复微信小程序
```
@project author: chyu(余承昊)、zxZhu(祝子贤)
@document author: zxZhu(祝子贤)
```
## 1. 版本日志（Version detial）
---
### v1.4.3
#### 新功能 :sparkles: :
1. 在`home`页面中新增了发送命令帧的功能，以便用户可以自行进行一些特殊命令帧的发送。
2. 在`home`页面中新增了一个全局变量检测器，每0.5秒查看全局变量是否有修改。
3. 在用户进行`连接蓝牙`、`开始记录`、`完成设置角度`新增校验器，保证用户操作合法。
4. 新增`upload——progress`组件，用于用户可视化上传过程。
5. 新增`fixFuction1`函数，用于将存储在蓝牙设备中过期数据取出上传并清空。

#### Bug修复 :bug: ：
1. 修复`home`页面与`setting`页面在进行页面切换时全局变量丢失问题。
2. 修复用户在上传数据时卡死问题（操作不当），已对相关敏感操作进行了隐藏。

#### 文档更新 :pencil: ：
1. 更新了Readme文件中的templet模块

#### 新样式 :lipstick: ： 
1. 在`home`页面中`扫描蓝牙`和`连接蓝牙`功能模块做了UI优化处理。
2. 可视化用户数据传输过程，即用户在结束记录时查看到当前进行到了第几步，现在一共上传了多少数据。
---
### v1.4.2
#### 新功能 :sparkles: :
1. 增加发送错误信息给服务器的工具`utils/catch-err`。
2. 给部分函数新增catch语法块，并且使用了记录报错工具。
---

### v1.4.1
#### 新功能 :sparkles: :
1. 新增了`蓝牙扫描连接`模块。
2. 在`record`页面中，给每个记录新增了记录备注功能。
---

## 2. 项目模板（Project templet）
在进行项目的迭代的过程中请尽量遵守以下模板规则~ :smile:
### 函数注释模板（fuction annotation templet）
```
/**
 * @description Performs the inverse operation of correctData function.
 * @param {number} num - The integer to be converted.
 * @param {number} len - The length of the resulting hexadecimal string.
 * @returns {string} The hexadecimal string.
 * @version 1.0.0
 * @author John Doe
 */
 ```

### 版本提交模板（git commit templet）
```
# :emoji: (Commit Type): Short Description (Max 50 characters)

# Body: Detailed description of the change. 
#       Can be as long as you want, includes "why" and "how"
#       If a bug fix, explain the problem and how the fix solves it.

# Footer: 
# Issue: [Issue Number]
```
#### 1. Emoji Type
```
:bookmark: (🔖) 发布新版本 
:sparkles: (✨) 当引入新功能时
:bug: (🐛) 当修复bug时
:recycle: (♻️) 当进行重构时
:pencil: (📝) 当写文档时
:white_check_mark: (✅) 当添加测试时
:hammer: (🔨) 当进行大的重构或改动时
:rocket: (🚀) 当提升性能时
:lipstick: (💄) 当改进UI/样式文件时
:construction: (🚧) 当工作进行中时
```

#### 2. Example
:sparkles: (Feature): Add login feature (Max 50 characters)

Body: This commit adds a new login feature to our application. 
      Users can now log in using their email and password. 
      This feature uses the new authentication API and follows 
      the design specified in the design document.

Issue: #123

:smile: (Docs): Update README

Body: This commit updates the README to include information about 
      the new login feature. It explains how to use the feature and 
      where to find more information.

Issue: #124

:bug: (Bugfix): Fix logout issue

Body: This commit fixes a bug where users were not able to log out 
      of the application. The problem was due to an incorrect API 
      endpoint. This commit updates the endpoint and adds a test to 
      prevent this issue in the future.

Issue: #125