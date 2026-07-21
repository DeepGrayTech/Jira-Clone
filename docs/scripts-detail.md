# 脚本工具详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

`scripts/` 目录包含用于测试、覆盖率、文档生成、诊断等辅助脚本。

---

## 2. 文件清单

| 文件 | 职责 |
|------|------|
| `generate-full-coverage-report.js` | 生成完整测试覆盖率分类报告 |
| `get-p0-coverage.js` | 生成 P0 核心文件覆盖率报告 |
| `run-tests.js` | 测试运行器 |

---

## 3. generate-full-coverage-report.js

**输入**: `./coverage/coverage-final.json`

**处理流程**:

```
输入：Jest 覆盖率 JSON 文件
  │
  ▼
[1] 读取 coverage-final.json
[2] 遍历每个文件，计算 statements / branches / functions 覆盖率
[3] 提取未覆盖行号
[4] 按覆盖率分类：低（<60%）、中（60%-80%）、高（≥80%）
[5] 按目录分组统计
[6] 计算总体统计
  │
  ▼
输出：控制台格式化的覆盖率报告
```

### 输出示例

```
=== 测试覆盖率详细报告 ===

1. 低覆盖率文件 (覆盖率 < 60%)
...

2. 中等覆盖率文件 (60% ≤ 覆盖率 < 80%)
...

3. 高覆盖率文件 (覆盖率 ≥ 80%)
...

4. 按目录分组统计
...

5. 总体统计
...
```

---

## 4. get-p0-coverage.js

**输入**: `./coverage/coverage-final.json`

**处理流程**:

```
输入：Jest 覆盖率 JSON 文件
  │
  ▼
[1] 定义 P0 文件列表：
    - LoginForm.tsx
    - GoalContext.tsx
    - contexts/index.ts
    - TasksView.tsx
    - useDataLoader.ts
[2] 读取覆盖率数据，匹配上述文件
[3] 计算语句覆盖率、分支覆盖率
[4] 判断是否 ≥80% 达标
  │
  ▼
输出：P0 文件覆盖率报告
```

### 输出示例

```
=== P0 文件覆盖率报告 ===

LoginForm.tsx:
  语句覆盖率: ...
  分支覆盖率: ...
  达标: ✓
```

---

## 5. run-tests.js

**输入**: 命令行参数或环境变量

**处理流程**:

```
输入：CLI 参数
  │
  ▼
[1] 解析参数（如 --watch, --coverage, --file）
[2] 调用 jest 或 npm test
[3] 输出测试结果
  │
  ▼
输出：测试执行结果
```

### 使用方式

```bash
node scripts/run-tests.js
node scripts/run-tests.js --coverage
node scripts/run-tests.js --watch
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
