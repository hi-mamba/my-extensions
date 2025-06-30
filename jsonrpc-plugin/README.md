# JSON-RPC Generator Plugin for IntelliJ IDEA

一个用于从 Spring Boot 方法生成 JSON-RPC 调用格式的 IntelliJ IDEA 插件。

## 功能特性

- **右键菜单集成**：在方法上右键显示"Generate JSON-RPC Call"选项
- **智能方法解析**：自动从 Spring Boot 注解中提取 RPC 方法名和路径
- **参数智能推断**：为方法参数生成合理的示例值
- **剪贴板集成**：生成的 JSON-RPC 自动复制到剪贴板
- **快捷键支持**：使用 `Ctrl+Alt+J` 快速生成

## 支持的注解

### 类级别注解
- `@RestController`
- `@RequestMapping`
- `@JsonRpcService` (自定义)

### 方法级别注解
- `@RequestMapping`
- `@PostMapping`
- `@GetMapping`
- `@JsonRpcMethod` (自定义)

## 使用方法

1. 在 Spring Boot 项目中打开 Java 文件
2. 将光标放在目标方法内或方法名上
3. 右键选择 "Generate JSON-RPC Call" 或按 `Ctrl+Alt+J`
4. 生成的 JSON-RPC 格式会显示在弹窗中并自动复制到剪贴板

## 示例

对于以下方法：

```java
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @PostMapping("/getUser")
    public User getUser(@RequestParam Long userId) {
        return new User();
    }
}
```

将生成：

```json
{
  "jsonrpc": "2.0",
  "method": "api/user.getUser",
  "params": {
    "userId": 1
  },
  "id": 1
}
```

## 参数类型支持

| Java 类型 | 生成示例值 |
|-----------|------------|
| `int/Integer` | `1` |
| `long/Long` | `1` |
| `String` | `"string"` |
| `boolean/Boolean` | `true` |
| `List<T>` | `["item1", "item2"]` |
| `Map<K,V>` | `{"key": "value"}` |
| `Array[]` | `["item1", "item2"]` |
| 自定义对象 | 智能推断字段结构 |

## 智能参数推断

插件会根据参数名智能生成示例值：

- 包含 "id" 的参数：生成数字 `1`
- 包含 "name" 的参数：生成 `"John"`
- 包含 "user" 的参数：生成用户对象结构
- 其他参数：根据类型生成默认值

## 构建和安装

### 开发环境要求
- JDK 11+
- IntelliJ IDEA 2020.3+

### 构建步骤

1. 克隆项目：
```bash
git clone <repository-url>
cd json-rpc-generator-plugin
```

2. 构建插件：
```bash
./gradlew buildPlugin
```

3. 生成的插件文件位于：`build/distributions/`

### 安装插件

1. 打开 IntelliJ IDEA
2. 进入 `File > Settings > Plugins`
3. 点击齿轮图标 > `Install Plugin from Disk...`
4. 选择构建生成的 `.zip` 文件
5. 重启 IDE

## 开发调试

运行开发版本：
```bash
./gradlew runIde
```

这将启动一个带有插件的 IntelliJ IDEA 实例。

## 项目结构

```
src/main/java/com/example/jsonrpc/
├── GenerateJsonRpcAction.java      # 主要动作类
├── JsonRpcGenerator.java           # JSON-RPC 生成器
└── JsonRpcCopyProvider.java        # 复制提供者

src/main/resources/META-INF/
└── plugin.xml                      # 插件配置

build.gradle                        # 构建配置
```

## 扩展功能

可以通过修改 `JsonRpcGenerator.java` 来：

1. 支持更多注解类型
2. 自定义参数生成规则
3. 添加更多智能推断逻辑
4. 支持不同的 JSON-RPC 版本

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
