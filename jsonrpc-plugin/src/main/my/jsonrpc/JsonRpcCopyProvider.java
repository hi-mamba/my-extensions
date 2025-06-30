package my.jsonrpc;

import com.intellij.ide.CopyProvider;
import com.intellij.openapi.actionSystem.DataContext;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.ide.CopyPasteManager;
import com.intellij.psi.*;
import com.intellij.psi.util.PsiTreeUtil;
import java.awt.datatransfer.StringSelection;

public class JsonRpcCopyProvider implements CopyProvider {

    @Override
    public void performCopy(DataContext dataContext) {
        Editor editor = CommonDataKeys.EDITOR.getData(dataContext);
        PsiFile psiFile = CommonDataKeys.PSI_FILE.getData(dataContext);

        if (editor == null || psiFile == null) return;

        int offset = editor.getCaretModel().getOffset();
        PsiElement element = psiFile.findElementAt(offset);
        PsiMethod method = PsiTreeUtil.getParentOfType(element, PsiMethod.class);

        if (method != null) {
            try {
                JsonRpcGenerator generator = new JsonRpcGenerator();
                String jsonRpc = generator.generateFromMethod(method);
                CopyPasteManager.getInstance().setContents(new StringSelection(jsonRpc));
            } catch (Exception e) {
                // 静默处理错误
            }
        }
    }

    @Override
    public boolean isCopyEnabled(DataContext dataContext) {
        return true;
    }

    @Override
    public boolean isCopyVisible(DataContext dataContext) {
        PsiFile psiFile = CommonDataKeys.PSI_FILE.getData(dataContext);
        return psiFile instanceof PsiJavaFile;
    }
}