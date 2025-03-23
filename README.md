# 签脚本 (Node.js 版)

## 简介
本项目是一个用于自动签到米家游戏（崩铁、原神）米游社的 Node.js 脚本。支持多账号，并可本地部署或通过 GitHub Actions 自动运行。

## 功能特性
- **多账号支持**: 同时支持多个账号的签到。
- **本地部署**: 可以在本地或服务器上运行脚本。
- **GitHub Actions 部署**: 可以通过 GitHub Actions 定期自动运行签到任务。

## 免责声明
本脚本仅供交流测试使用。因使用本脚本而产生的任何问题，作者概不负责。官方可能更改接口导致脚本失效，脚本失效会尽快更新，但不保证第一时间。请低调使用，如有不同意，请关闭并停止使用。

## 获取 Cookie 方式 - 必需

1. **打开浏览器**:
   - 打开你的浏览器，进入无痕/隐身模式。
   
2. **登录米游社**:
   - 访问 [原神论坛](http://bbs.mihoyo.com/ys) 或 [崩铁论坛](http://bbs.mihoyo.com/sr)，二选一进行登录操作。
   
3. **获取 Cookie**:
   - 按下键盘上的 `F12` 或右键点击页面选择“检查”，打开开发者工具。
   - 切换到“Console”选项卡，复制粘贴以下代码：
     ```js
     const cookie = document.cookie
      const ask = confirm('Cookie:' + cookie + '\n\nDo you want to copy the cookie to the clipboard?')
      if (ask == true) {
        copy(cookie)
        msg = cookie
      } else {
        msg = 'Cancel'
      }
     ```
   - 按下回车键，此时 Cookie 已经复制到你的剪贴板，原神崩铁Cookie通用。



## GitHub Actions 部署

你可以通过 GitHub Actions 定期自动运行签到任务。以下是配置步骤：

1. **Fork本仓库**

2. **配置 GitHub Secrets**:
   - 打开你的 Fork 仓库页面。
   - 点击 `Settings` -> `Secrets and variables` -> `Actions`。
   - 添加新的 Secret, 多个cookie用英文逗号(,)分隔，若cookie下有原神/崩铁角色会执行签到：
     - 名称: `GENSHIN_COOKIES`
       值: `cookie1,cookie2,cookie3`

3. **创建 Workflow 文件**:
   - 在 `.github/workflows` 目录下创建一个新的 YAML 文件，例如 `main.yml`。

4. **YAML 配置示例**:

   ```yaml
   name: MiHoYo Sign-In Script

   on:
     schedule:
       - cron: '20 23 * * *' # 每天UTC 23:20, 对应北京时间7:20，实际运行时间有偏差。
     workflow_dispatch: # 允许手动触发

   jobs:
     build-and-run:
       runs-on: ubuntu-latest

       steps:
       - name: Checkout repository
         uses: actions/checkout@v3

       - name: Set up Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '18'

       - name: Install dependencies
         run: npm install

       - name: Run main.js
         env:
           GENSHIN_COOKIES: ${{ secrets.GENSHIN_COOKIES }}
         run: node main.js
   ```

## 本地部署

1. **安装 Node.js**:
   - 确保你已安装 Node.js 版本大于 14.x。
   
2. **Clone项目**:
   ```sh
   git clone https://github.com/GildedFlames/MYS_Game_Singin.git
   ```
   
3. **安装依赖**:
   ```sh
   npm install
   ```

4. **在 main.js getCookieConfig 方法中设置Cookie信息**:
     ```js
     const genshinCookies = 'cookie1,cookie2'
     ```

5. **运行脚本**:
   ```sh
   node main.js
   ```

## 更新日志

- **2025-02-08**: 初始发布，支持原神和崩铁多账号签到功能。
