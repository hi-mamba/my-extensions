package my.jsonrpc;
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.Messages;
import com.intellij.psi.*;
import com.intellij.psi.util.PsiTreeUtil;
import com.intellij.openapi.ide.CopyPasteManager;
import java.awt.datatransfer.StringSelection;

public class GenerateJsonRpcAction extends AnAction {

    @Override
    public void actionPerformed(AnActionEvent e) {
        Project project = e.getProject();
        if (project == null) return;

        Editor editor = e.getData(CommonDataKeys.EDITOR);
        if (editor == null) return;

        PsiFile psiFile = e.getData(CommonDataKeys.PSI_FILE);
        if (psiFile == null) return;

        // 获取当前光标位置的元素
        int offset = editor.getCaretModel().getOffset();
        PsiElement element = psiFile.findElementAt(offset);

        // 查找包含当前位置的方法
        PsiMethod method = PsiTreeUtil.getParentOfType(element, PsiMethod.class);
        if (method == null) {
            Messages.showWarningDialog("请将光标放在方法内或方法名上", "未找到方法");
            return;
        }

        try {
            // 生成 JSON-RPC 格式
            String jsonRpc = generateJsonRpc(method);

            // 复制到剪贴板
            CopyPasteManager.getInstance().setContents(new StringSelection(jsonRpc));

            // 显示生成的内容
            Messages.showInfoMessage(project,
                    "JSON-RPC 调用已复制到剪贴板:\n\n" + jsonRpc,
                    "JSON-RPC 生成成功");

        } catch (Exception ex) {
            Messages.showErrorDialog("生成 JSON-RPC 时发生错误: " + ex.getMessage(), "错误");
        }
    }

    @Override
    public void update(AnActionEvent e) {
        // 只在 Java 文件中显示此动作
        PsiFile psiFile = e.getData(CommonDataKeys.PSI_FILE);
        boolean isJavaFile = psiFile instanceof PsiJavaFile;
        e.getPresentation().setEnabledAndVisible(isJavaFile);
    }

    private String generateJsonRpc(PsiMethod method) {
        JsonRpcGenerator generator = new JsonRpcGenerator();
        return generator.generateFromMethod(method);
    }
}