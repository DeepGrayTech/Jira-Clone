# API 数据映射器说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 文件位置

`lib/api-mappers.ts`

---

## 2. 设计目的

Prisma + SQLite 将数组字段存储为 JSON 字符串，且部分枚举/状态值存在历史别名。`api-mappers.ts` 负责：

1. 将数据库 JSON 字符串解析为数组。
2. 将 Date 对象格式化为 ISO 8601 字符串。
3. 将历史状态别名归一化为当前有效值。

---

## 3. 通用处理流程

```
输入：Prisma 原始记录 (Record<string, unknown>)
  │
  ▼
[1] 解析数组字段 (parseJsonArray)
  │   输出：string[]
  ▼
[2] 格式化时间戳 (parseIsoTimestamp)
  │   输出：ISO 字符串 或 undefined
  ▼
[3] 归一化状态 (normalizeStatus)
  │   输出：有效状态字符串
  ▼
输出：前端可用的标准化对象
```

---

## 4. 辅助函数说明

### 4.1 parseJsonArray(value: unknown): string[]

**输入**: 任意值（可能是数组、JSON 字符串、空值）

**处理**:
- 如果是数组，直接返回。
- 如果是非空字符串，尝试 JSON.parse，解析为数组则返回。
- 其他情况返回空数组。

**输出**: `string[]`

---

### 4.2 parseIsoTimestamp(value: unknown): string | undefined

**输入**: 任意值（Date 对象或字符串）

**处理**:
- Date 对象 → `toISOString()`
- 非空字符串 → 原样返回
- 其他 → undefined

**输出**: ISO 时间字符串或 undefined

---

### 4.3 normalizeStatus(value, valid): string | undefined

**输入**: 状态字符串、有效状态列表

**处理**:
- 如果值已在有效列表中，直接返回。
- 如果匹配历史别名，映射后再校验。

**别名映射**:

| 别名 | 映射值 |
|------|--------|
| IN_REVIEW | REVIEW |
| ACTIVE | NOT_STARTED |
| TODO | PENDING |

**输出**: 有效状态字符串或 undefined

---

## 5. 实体映射函数

### 5.1 mapTask(raw)

**输入**: Prisma Task 记录

**处理**:
- `tags` JSON 字符串 → string[]
- `createdAt`/`updatedAt` → ISO 字符串

**输出**: 标准化 Task 对象

---

### 5.2 mapRequirement(raw)

**输入**: Prisma Requirement 记录

**处理**:
- `status` 归一化（有效值：DRAFT, REVIEW, APPROVED, IMPLEMENTED）
- `acceptanceCriteria` JSON 字符串 → string[]
- 日期格式化

**输出**: 标准化 Requirement 对象

---

### 5.3 mapTestCase(raw)

**输入**: Prisma TestCase 记录

**处理**:
- `status` 归一化（有效值：PENDING, PASSED, FAILED, BLOCKED）
- `steps` JSON 字符串 → string[]
- 日期格式化

**输出**: 标准化 TestCase 对象

---

### 5.4 mapBug(raw)

**输入**: Prisma Bug 记录

**处理**:
- `stepsToReproduce` JSON 字符串 → string[]
- 日期格式化

**输出**: 标准化 Bug 对象

---

### 5.5 mapGoal(raw)

**输入**: Prisma Goal 记录（含嵌套 milestones/keyResults）

**处理**:
- `status` 归一化（有效值：NOT_STARTED, IN_PROGRESS, ON_TRACK, AT_RISK, ACHIEVED）
- `type` 默认值为 OKR
- `startDate`/`endDate` 格式化
- 递归映射 `milestones` 和 `keyResults`

**输出**: 标准化 Goal 对象

---

### 5.6 mapMilestone(raw)

**输入**: Prisma Milestone 记录

**处理**:
- `dueDate`/`completedAt` 格式化
- 日期格式化

**输出**: 标准化 Milestone 对象

---

### 5.7 mapKeyResult(raw)

**输入**: Prisma KeyResult 记录

**处理**:
- `status` 归一化（有效值：ON_TRACK, AT_RISK, BEHIND）
- `targetValue`/`currentValue` 强制转换为 number
- 日期格式化

**输出**: 标准化 KeyResult 对象

---

## 6. 使用位置

所有 `app/api/*/route.ts` 在返回响应前调用对应映射函数，确保前端接收到的数据格式一致。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
