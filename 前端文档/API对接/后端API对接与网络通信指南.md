# 后端 API 对接与网络通信指南

## 目录
1. [引言](#引言)
2. [Axios 实例与全局拦截器](#axios-实例与全局拦截器)
3. [核心 API 模块分布](#核心-api-模块分布)
4. [跨域与代理配置 (Vite Server Proxy)](#跨域与代理配置-vite-server-proxy)
5. [实时通信 (WebSocket & SSE) 对接细节](#实时通信-websocket--sse-对接细节)

## 引言

本指南详细说明了交通仿真系统前端项目（traffic_sim_frontend）如何与后端 Spring Boot 微服务/插件化单体应用进行网络通信。内容涵盖了基础的 HTTP 请求封装、各业务模块的 API 定义、开发环境的跨域配置，以及在实时仿真和历史回放场景下复杂双向/单向长连接（WebSocket/SSE）的实现细节。

## Axios 实例与全局拦截器

前端项目中所有的标准 HTTP 请求均通过 `src/mods/Axios.ts` 中配置的全局 Axios 实例发起。该实例对请求头、超时和错误处理进行了统一封装，是前端与后端 RESTful API 交互的基础枢纽。

### 1. 基础配置
-   **BaseURL 动态切换**:
    通过 Vite 的环境变量 `import.meta.env.DEV` 判断当前环境。
    -   开发环境 (DEV): `http://192.168.1.212:3822`（注意：部分配置可能通过 Vite Proxy 代理了 `/api`，此处配置需结合实际部署环境调整）。
    -   生产环境 (PROD): `http://127.0.0.1:3822/`。
-   **超时与跨域凭证**:
    -   `timeout: 50000` (50秒)，考虑到仿真任务创建或大文件上传可能耗时较长。
    -   `withCredentials: true`，允许跨域请求携带 Cookie。

### 2. 请求拦截器 (Request Interceptor)
-   **自动附加 Token**:
    每次发送请求前，拦截器会调用 `getToken()` 从 localStorage 中获取 JWT Token。
    如果存在，则自动在请求头中添加 `Authorization: Bearer <token>`，实现无感知的身份验证。

### 3. 响应拦截器 (Response Interceptor)
-   **统一错误处理与鉴权失效**:
    拦截器监控所有后端的响应状态码。
    当捕获到 `401 Unauthorized`（未授权或 Token 过期）时：
    1.  调用 `clearAuthInfo()` 清除本地存储的 Token 和用户信息。
    2.  强制页面重定向至 `/login` (`window.location.href = "/login"`），要求用户重新登录。

## 核心 API 模块分布

为了保证代码的可维护性，所有的 API 请求都被提取到 `src/apis` 目录下的独立文件中，按业务领域划分：

1.  **AuthApi.ts (认证与授权)**
    -   处理用户的登录（`/api/auth/login`）、注册、登出等操作。
2.  **MapApi.ts (地图管理)**
    -   处理地图列表获取、地图详情查询和删除。对应后端的旧版兼容接口（如 `/getUserMap`, `/deleteMap`）或新版 REST 接口。
3.  **SimPIApi.ts (交互仿真配置)**
    -   **核心功能**: `GetMapJson` - 在向导中上传地图后，获取路网结构的 JSON 数据。
    -   获取仿真实例的一次性认证 ID（`/cookie_id`）。
    -   查询后端可用的插件信息（`/simulation/get_plugin_info`）。
4.  **SimRecordApi.ts (仿真记录与历史)**
    -   **核心功能**: `getSimRecords` - 分页获取历史仿真记录列表（`/simulation/list`）。
    -   该文件定义了严格的 TypeScript 接口（如 `ApiSimRecordRaw` 和 `SimRecord`），并在前端进行了数据清洗和格式转换，抹平了后端原始数据与前端 UI 表格展示之间的差异。

## 跨域与代理配置 (Vite Server Proxy)

在本地开发阶段，前端运行在本地开发服务器（如 `localhost:7142`），而后端 API 运行在另一个地址。为了避免浏览器的同源策略（CORS）限制，项目在 `vite.config.ts` 中配置了代理服务器。

```typescript
// vite.config.ts 节选
server: {
  proxy: {
    "/api": {
      target: "http://192.168.1.212:3822",
      changeOrigin: true, // 更改请求头中的 Origin 为 target URL
      secure: false,      // 支持自签名 SSL 证书
      ws: true,           // 支持 WebSocket 代理
      // rewrite: (path) => path.replace(/^\/api/, ""), // 注意：目前未重写路径，后端需处理 /api 前缀
    },
  },
  port: 7142,
}
```

**关键点**:
所有以 `/api` 开头的请求都会被 Vite 开发服务器拦截，并透明地转发到 `http://192.168.1.212:3822/api`。同时启用了 `ws: true`，确保 WebSocket 握手请求也能被正确代理。

## 实时通信 (WebSocket & SSE) 对接细节

交通仿真系统不仅依赖于传统的 HTTP 请求，其核心的监控和回放功能高度依赖于长连接技术。

### 1. 实时仿真监控 (WebSocket)
-   **应用场景**: `SimPIView.vue` (实时监控面板)。
-   **通信流程**:
    -   前端通过 WebSocket API 连接到后端的 `/ws/frontend` 端点。
    -   建立连接后，必须遵循后端的自定义协议格式：`{"type": "frontend", "ope": "hello"}` 进行握手。
    -   随后，前端发送启动指令，后端开始源源不断地推送包含大量车辆坐标 (`x`, `y`) 和信号灯状态 (`sim_data`) 的 JSON 字符串。
-   **鉴权**: 依赖于建立连接时浏览器自动携带的 Cookie（其中包含 `id` 即 session_id）。

### 2. 历史数据回放 (SSE - Server-Sent Events)
-   **应用场景**: `SimReplayView.vue` (历史回放器)。
-   **通信特点**: 后端（`ReplayServiceImpl`）需要将大量的历史切片数据按时间序列单向推送到前端。
-   **前端实现挑战与突破**:
    由于原生的 `EventSource` 对象无法自定义 HTTP 请求头（无法附加 JWT Token），这会导致 `401 Unauthorized`。
    为此，前端采用了**原生的 Fetch API 模拟 SSE 客户端**的方案：
    1.  构造带有 `Authorization: Bearer <token>` 头的 Fetch GET 请求到 `/replay/stream/{sessionId}`。
    2.  获取响应的流读取器 `response.body.getReader()`。
    3.  在一个 `while(true)` 循环中持续读取 `Uint8Array` 格式的 chunks，并使用 `TextDecoder` 解码为字符串。
    4.  通过自定义的 `parseEventStream` 函数，手动解析标准的 SSE 文本格式（即遇到空行 `\n\n` 视为一个事件结束，解析出 `event: type` 和 `data: payload`）。
    5.  根据解析出的事件类型（`start`, `data`, `seeked`, `stopped`, `end`），触发前端相应的业务逻辑更新 Pixi 画布。

### 3. 回放控制 (HTTP REST)
与 SSE 数据流分离，回放的进度控制（播放、暂停、拖拽进度条 `seek`、倍速 `speed`）是通过独立的 HTTP POST 请求完成的：
-   端点: `POST /replay/control/{sessionId}/{endpoint}`
-   前端发送控制指令后，后端的 SSE 数据流会立即响应状态变化（例如 `seek` 操作后，SSE 流会跳过中间帧，直接推送目标帧，并触发一个 `seeked` 事件同步前端状态）。这种**指令与数据流分离**的设计，保证了控制的高响应性和数据传输的高吞吐量。