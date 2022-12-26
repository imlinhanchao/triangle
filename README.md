<p align="center">
  <img width="200" src="./public/logo.png">
</p>

<h1 align="center">Triangle</h1>

一个 SSR 网站开发代码模板，基于 Quasar UI 框架，Vue3 前端框架，Vite 构建工具，同时内置了一个 Express 后端提供功能 API（已有完成基本的用户系统）

## ⚙️ 调试

1. 执行`npm install`;
2. 前端执行`npm run dev`，后端使用 Visual Studio Code 运行调试（直接按下`F5`即可），若有其他后端可以直接移除 `server` 文件夹。

## 📦 后端服务配置

1. 新建数据库`db`(根据需要，第二步配置时填入)；
2. 执行`npm run initsvr`，并根据提示填写信息（仅第一次）；
3. 若需要重新配置数据库，则运行`npm run initdb`，**此步骤会清除表数据！**
4. 若需要重置某个表，如：重置`account`表，则执行`npm run initdb -- account`。

## 更多细节

等待完善...
