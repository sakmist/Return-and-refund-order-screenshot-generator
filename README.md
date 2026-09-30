# 退货退款订单截图生成器

[English](https://github.com/sakmist/Return-and-refund-order-screenshot-generator/blob/main/README_en.md)

这是一个用于生成退货退款订单截图的在线工具。它可以帮助用户快速生成看起来真实的退货订单截图，主要用于学习目的。

> ⚠️ 免责声明：此工具仅供学习交流使用，请勿用于伪造或误导他人。实际寄件信息必须与快递真实信息一致。

## 功能特点

- 快速生成拼多多退货退款订单截图
- 可自定义收货人姓名、电话和地址
- 支持从剪贴板自动解析并填充联系人信息
- 一键生成高清截图并下载
- 响应式设计，支持不同屏幕尺寸

## 使用方法

```bash
npm install
npm run dev
```

打开终端提示的本地地址（默认 http://localhost:5173），然后：

1. 在右侧表单中填写相关信息：
   - 收货人（包括姓名和电话）
   - 收货地址
2. 点击「生成截图」按钮
3. 浏览器会自动下载生成的截图

### 自动填充功能

您可以复制一段包含姓名、电话和地址的文本，然后点击「粘贴自动填」按钮，系统会自动解析并填充相应字段。

示例格式：
```
收货人：张三 13812345678
收货地址：北京市朝阳区某某街道某某大厦123号
```

## 技术实现

- Vue 3（`<script setup>` 单文件组件 + 组合式函数）
- Vite 构建，Tailwind CSS 处理样式
- 使用 modern-screenshot（SVG foreignObject）实现网页截图功能，由浏览器栅格化真实 DOM，文字位置与预览一致
- 配置化字段和图层显示

## 项目结构

```
index.html                  # Vite 入口
public/config.json          # 运行时配置（字段与图层）
src/
  main.js                   # 应用入口
  App.vue                   # 页面布局与状态编排
  style.css                 # Tailwind 指令与自定义样式
  components/
    PreviewScreen.vue       # 截图区域容器
    LayerNode.vue           # 递归渲染图层（支持分组嵌套）
    ControlPanel.vue        # 右侧操作区
    ConfigField.vue         # 单个配置字段输入
  composables/
    useOrderConfig.js       # 加载配置、维护表单值与图层文本
    useScreenshot.js        # 截图与下载
    useClipboardAutofill.js # 剪贴板解析自动填充
  utils/
    address.js              # 姓名/电话/地址文本解析
    field.js                # 字段输入属性推导
    time.js                 # 时间格式化
  assets/                   # 字体与背景图（由 Vite 处理）
```

## 配置说明

项目通过 [public/config.json](public/config.json) 进行配置：

- `fields`: 定义表单字段
- `layers`: 定义截图中的图层元素及其样式

`layers` 支持 `group` 类型并通过 `children` 嵌套子图层，文本为 `static` 时取自 `text` 字段，否则取自对应 `fieldId` 的表单值。

## 构建与部署

```bash
npm run build     # 产物输出到 dist/
npm run preview   # 本地预览构建产物
```

构建产物使用相对路径（`base: './'`），可直接部署到任意静态托管（包括子路径场景）。

## 注意事项

- 此工具仅为学习交流目的而创建
- 请勿将生成的截图用于非法用途
- 实际使用时请确保所有信息的真实性和准确性
- 寄件信息必须与快递单上的真实信息保持一致

## 许可证

本项目仅供个人学习使用。
