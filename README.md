# 电商标签识别系统

本仓库实现了一个完整的 Web 应用，用于电商质检场景中的箱标/产品标/地址标/原产地标的识别与校验。系统按前后端分离的架构设计，涵盖用户认证、动态内容渲染、API 文档生成、容器化部署、反向代理和性能监控等功能。

## 项目概览

系统以 Node.js/Express 为后端核心，负责用户管理、图像分析请求和字段比对逻辑。前端采用 React 与 React Router DOM 构建，提供登录页、上传/分析界面和规则查看界面。数据库选择 MongoDB 存储用户信息和业务数据。通过 `swagger-jsdoc` 和 `swagger-ui-express` 自动生成符合 OpenAPI 3.1 规范的接口文档，便于前端开发人员直观了解 API【262675828911296†L146-L200】。后端使用 `express-prom-bundle` 中间件暴露 `/metrics` 端点收集请求次数、耗时等指标【455913028903444†L52-L106】。Prometheus 配置为每 15 秒抓取一次这些指标【455913028903444†L116-L123】并存储，Grafana 通过预置的数据源和仪表盘将其可视化【455913028903444†L126-L140】。

部署方面，采用多阶段 Docker 构建：一阶段编译前端并将静态文件复制到 Nginx 镜像中；二阶段由 Nginx 作为反向代理，将前端的静态资源和 API 请求分别代理到 React 构建结果和后端服务。使用 Nginx 能够缓存静态内容、均衡负载并提升 Node 应用的吞吐能力【871970565824664†L138-L156】。Docker Compose 定义了 backend、mongodb、nginx、prometheus 和 grafana 五个服务，通过互联网络使 Prometheus 能够抓取 Express 暴露的指标并由 Grafana 展示。代码风格遵循 Airbnb JavaScript 风格指南，结合 ESLint 和 Prettier 自动检查与格式化，使项目风格保持统一【979422348977326†L40-L64】。

## 功能

- **用户认证**：支持注册和登录，密码使用 bcrypt 哈希存储。登录成功后服务器返回一个 JSON Web Token，客户端需在后续请求中携带 `Authorization: Bearer &lt;token&gt;` 头。验证中间件会解析并验证该令牌【374393436294486†L310-L344】。
- **图片分析**：向 `/api/analyze` 上传一张或多张 Base64 图片并可选 `type` 参数。后端会将请求转发到 `MODEL_API_URL` 指向的大模型/视觉服务（可在 `MODEL_API_KEY` 中配置令牌），并返回条码、文本、匹配结果及最终判定等结构化数据；未配置外部服务时则返回模拟结果，便于前端联调。
- **字段比对**：向 `/api/compare` 提交提取出的字段及系统资料，接口返回每个字段的目标值、系统值、Levenshtein 距离和通过判定，示例中允许 2 字符容错。
- **规则配置**：`/api/rules` GET 获取当前正则规则、原产地映射等，PUT 请求可在线更新规则。
- **API 文档**：在运行环境中访问 `/api-docs` 可查看基于 Swagger UI 的接口说明，包括请求体、响应示例和安全策略。文档由 JSDoc 注释生成，无需维护单独的 YAML 文件【262675828911296†L146-L204】。
- **监控与可视化**：使用 `express-prom-bundle` 中间件自动记录每个请求的速率、耗时和大小等指标【455913028903444†L52-L106】。Prometheus 配置文件设定了 15 秒的抓取间隔【455913028903444†L116-L123】。Grafana 在启动时从 `grafana/provisioning` 目录自动加载 Prometheus 数据源和仪表盘配置，仪表盘包含请求延迟 95 分位数和请求吞吐量等关键图表。

## 目录结构

```
ecom-label-app/
├── backend/             # Node.js/Express 后端
│   ├── config/          # 数据库连接配置
│   ├── models/          # Mongoose 模型
│   ├── routes/          # 路由和业务逻辑
│   ├── middlewares/     # JWT 身份验证中间件
│   ├── .env.sample      # 环境变量示例
│   ├── package.json     # 后端依赖
│   └── server.js        # 入口文件
├── frontend/            # React 前端
│   ├── public/
│   ├── src/             # 页面与组件
│   ├── package.json     # 前端依赖
│   └── Dockerfile*      # 由 Nginx 多阶段构建取代
├── nginx/               # Nginx 配置文件
├── prometheus/          # Prometheus 抓取配置
├── grafana/             # Grafana 数据源及仪表盘
├── Dockerfile.backend   # 构建后端镜像
├── Dockerfile.nginx     # 构建 Nginx+前端镜像
├── docker-compose.yml   # 定义所有服务
├── .eslintrc.json       # 根目录 ESLint 配置
└── .prettierrc.json     # Prettier 配置
```

## 快速开始

在宿主机上安装 [Docker](https://docs.docker.com) 和 [Docker Compose](https://docs.docker.com/compose/)。然后克隆本仓库并执行以下步骤：

```sh
cd ecom-label-app
# 根据需要修改 backend/.env.sample 并保存为 backend/.env
cp backend/.env.sample backend/.env
# 构建并启动全部服务（前端、后端、数据库、Prometheus、Grafana）
docker compose up --build
```

构建过程分两阶段：首先使用 Node 容器编译前端静态文件，然后由 Nginx 容器加载自定义配置并代理所有请求。启动成功后，可以访问：

- `http://localhost` – 访问 React 前端应用。
- `http://localhost/api` – 后端 API 根路径（需要携带 JWT）。
- `http://localhost/api-docs` – Swagger UI 接口文档。
- `http://localhost/metrics` – Prometheus 指标端点，由 Nginx 代理到 Express 应用。
- `http://localhost:9090` – Prometheus UI。
- `http://localhost:7000` – Grafana 仪表盘，默认用户名 `admin`，密码见 docker-compose 环境变量。

## 开发与测试

开发环境下可以单独启动后端和前端：

```sh
# 在终端 A 中启动后端
cd ecom-label-app/backend
cp .env.sample .env  # 根据需要修改
npm install
npm run dev

# 在终端 B 中启动前端
cd ecom-label-app/frontend
npm install
npm start
```

前端默认将请求代理到 `/api`，无需额外配置。开发模式下 ES Lint 和 Prettier 会在保存时检查代码规范，确保符合 Airbnb 风格指南【979422348977326†L40-L64】。

## 接口列表

| 方法 | 路径            | 描述          |
|------|-----------------|---------------|
| POST | `/auth/register`| 用户注册      |
| POST | `/auth/login`   | 用户登录，返回 JWT |
| POST | `/analyze`      | 解析图片，返回结构化结果 |
| POST | `/compare`      | 比对字段，返回距离与通过判定 |
| GET  | `/rules`        | 获取当前校验规则 |
| PUT  | `/rules`        | 更新校验规则 |

完整的请求和响应字段请参考 `http://localhost/api-docs` 中生成的 Swagger 文档。

## 监控和仪表盘

后端集成的 `express-prom-bundle` 中间件将每个请求的速率、持续时间和大小暴露为 Prometheus 指标【455913028903444†L52-L106】。Prometheus 根据配置文件定期抓取这些指标【455913028903444†L116-L123】。Grafana 的预置仪表盘展示了请求延迟的 95 百分位、各 HTTP 方法的吞吐量等信息，可根据需要自定义查询和图表。使用 Grafana 时，在左侧菜单中选择 “Dashboards → Manage” 即可找到 “Backend Metrics” 仪表盘。

## 贡献

欢迎提交 issue 或 PR 共同完善该项目。提交代码前请运行 `npm run lint` 确保代码通过 ESLint 检查，并遵循项目现有的目录结构和编码风格。

## 许可

本项目基于 MIT 许可证发布。详见 `LICENSE` 文件。