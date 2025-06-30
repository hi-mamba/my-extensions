package my.jsonrpc;

import com.intellij.psi.*;
import com.intellij.psi.util.PsiTreeUtil;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.*;

public class JsonRpcGenerator {

    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public String generateFromMethod(PsiMethod method) {
        // 获取方法所在的类
        PsiClass containingClass = method.getContainingClass();
        if (containingClass == null) {
            throw new RuntimeException("无法找到方法所在的类");
        }

        // 提取 RPC 方法名
        String rpcMethod = extractRpcMethodName(containingClass, method);

        // 提取方法参数
        Map<String, Object> params = extractMethodParameters(method);

        // 构建 JSON-RPC 请求
        Map<String, Object> jsonRpcRequest = new HashMap<>();
        jsonRpcRequest.put("jsonrpc", "2.0");
        jsonRpcRequest.put("method", rpcMethod);
        jsonRpcRequest.put("params", params);
        jsonRpcRequest.put("id", 1);

        return gson.toJson(jsonRpcRequest);
    }

    private String extractRpcMethodName(PsiClass clazz, PsiMethod method) {
        String serviceName = "";
        String methodName = method.getName();

        // 从类注解中提取服务名
        PsiAnnotation serviceAnnotation = clazz.getAnnotation("com.example.JsonRpcService");
        if (serviceAnnotation == null) {
            // 尝试其他可能的注解
            serviceAnnotation = clazz.getAnnotation("org.springframework.web.bind.annotation.RequestMapping");
            if (serviceAnnotation == null) {
                serviceAnnotation = clazz.getAnnotation("org.springframework.web.bind.annotation.RestController");
            }
        }

        if (serviceAnnotation != null) {
            PsiAnnotationMemberValue value = serviceAnnotation.findAttributeValue("value");
            if (value != null) {
                String path = extractStringValue(value);
                if (path != null && !path.isEmpty()) {
                    serviceName = path.replaceAll("^/", "").replaceAll("/$", "");
                }
            }
        }

        // 从方法注解中提取方法名
        PsiAnnotation methodAnnotation = method.getAnnotation("com.example.JsonRpcMethod");
        if (methodAnnotation == null) {
            // 尝试 Spring 注解
            methodAnnotation = method.getAnnotation("org.springframework.web.bind.annotation.RequestMapping");
            if (methodAnnotation == null) {
                methodAnnotation = method.getAnnotation("org.springframework.web.bind.annotation.PostMapping");
            }
            if (methodAnnotation == null) {
                methodAnnotation = method.getAnnotation("org.springframework.web.bind.annotation.GetMapping");
            }
        }

        if (methodAnnotation != null) {
            PsiAnnotationMemberValue value = methodAnnotation.findAttributeValue("value");
            if (value != null) {
                String path = extractStringValue(value);
                if (path != null && !path.isEmpty()) {
                    methodName = path.replaceAll("^/", "").replaceAll("/$", "");
                }
            }
        }

        // 组合服务名和方法名
        if (!serviceName.isEmpty()) {
            return serviceName + "." + methodName;
        }

        // 如果没有找到服务名，使用类名（转换为小写）
        String className = clazz.getName();
        if (className != null) {
            // 移除 Controller 或 Service 后缀
            className = className.replaceAll("(Controller|Service)$", "");
            // 转换为小写并添加点
            serviceName = className.substring(0, 1).toLowerCase() + className.substring(1);
            return serviceName + "." + methodName;
        }

        return methodName;
    }

    private Map<String, Object> extractMethodParameters(PsiMethod method) {
        Map<String, Object> params = new LinkedHashMap<>();

        PsiParameter[] parameters = method.getParameterList().getParameters();

        for (PsiParameter parameter : parameters) {
            String paramName = parameter.getName();
            if (paramName == null) continue;

            // 跳过 Spring 框架相关的参数
            if (isFrameworkParameter(parameter)) {
                continue;
            }

            PsiType paramType = parameter.getType();
            Object defaultValue = generateDefaultValue(paramType, paramName);
            params.put(paramName, defaultValue);
        }

        return params;
    }

    private boolean isFrameworkParameter(PsiParameter parameter) {
        PsiType type = parameter.getType();
        String typeName = type.getCanonicalText();

        // Spring 框架相关的参数类型
        return typeName.contains("HttpServletRequest") ||
                typeName.contains("HttpServletResponse") ||
                typeName.contains("HttpSession") ||
                typeName.contains("Authentication") ||
                typeName.contains("Principal") ||
                parameter.hasAnnotation("org.springframework.web.bind.annotation.RequestHeader") ||
                parameter.hasAnnotation("org.springframework.web.bind.annotation.PathVariable");
    }

    private Object generateDefaultValue(PsiType type, String paramName) {
        String typeName = type.getCanonicalText();

        // 基本类型
        if (typeName.equals("int") || typeName.equals("java.lang.Integer")) {
            return 1;
        } else if (typeName.equals("long") || typeName.equals("java.lang.Long")) {
            return 1L;
        } else if (typeName.equals("double") || typeName.equals("java.lang.Double")) {
            return 1.0;
        } else if (typeName.equals("float") || typeName.equals("java.lang.Float")) {
            return 1.0f;
        } else if (typeName.equals("boolean") || typeName.equals("java.lang.Boolean")) {
            return true;
        } else if (typeName.equals("java.lang.String")) {
            return "string";
        } else if (typeName.startsWith("java.util.List")) {
            return Arrays.asList("item1", "item2");
        } else if (typeName.startsWith("java.util.Map")) {
            Map<String, Object> map = new HashMap<>();
            map.put("key", "value");
            return map;
        } else if (type instanceof PsiArrayType) {
            return Arrays.asList("item1", "item2");
        } else {
            // 对于自定义对象，创建一个示例结构
            return generateObjectExample(type, paramName);
        }
    }

    private Map<String, Object> generateObjectExample(PsiType type, String paramName) {
        Map<String, Object> example = new HashMap<>();

        // 根据参数名提供一些智能默认值
        if (paramName.toLowerCase().contains("id")) {
            example.put("id", 1);
        } else if (paramName.toLowerCase().contains("name")) {
            example.put("name", "John");
        } else if (paramName.toLowerCase().contains("user")) {
            example.put("id", 1);
            example.put("name", "John");
            example.put("email", "john@example.com");
        } else {
            // 尝试从类型中提取字段信息
            example.put("field1", "value1");
            example.put("field2", "value2");
        }

        return example;
    }

    private String extractStringValue(PsiAnnotationMemberValue value) {
        if (value instanceof PsiLiteralExpression) {
            Object val = ((PsiLiteralExpression) value).getValue();
            return val != null ? val.toString() : null;
        }
        return null;
    }
}