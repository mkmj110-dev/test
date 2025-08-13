# 学生管理系统 (FastAPI + SQLite)

## 快速开始

1. 安装依赖

```bash
pip install -r /workspace/student_mgmt/requirements.txt
```

2. 启动服务

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

3. 打开浏览器访问

- 前端页面: http://localhost:8000/
- API 文档: http://localhost:8000/docs

## 目录结构

- `app/main.py`: FastAPI 应用入口
- `app/models.py`: SQLAlchemy 模型
- `app/schemas.py`: Pydantic 模型
- `app/database.py`: 数据库连接与会话
- `app/routers/`: 各模块路由
- `app/static/`: 前端静态页面