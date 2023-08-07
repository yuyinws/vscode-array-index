import { extname } from 'node:path'
import * as vscode from 'vscode'
import { ScriptTarget, createSourceFile, forEachChild, isArrayLiteralExpression } from 'typescript'
import { parse } from '@vue/compiler-sfc'

export function decorators() {
  function createDecorator(text: string): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
      after: {
        contentText: text,
        color: new vscode.ThemeColor('editor.foreground'),
        border: '1px dashed',
        borderColor: new vscode.ThemeColor('editor.selectionBackground'),
        fontWeight: 'lighter',
        fontStyle: 'italic',
        margin: '0 12px 0 0',
      },
    })
  }

  let decorators: vscode.TextEditorDecorationType[] = []

  function disposeDecorators() {
    decorators.forEach((decorator) => {
      decorator.dispose()
    })
    decorators = []
  }

  function setDecorators() {
    const visibleTextEditors = vscode.window.visibleTextEditors

    visibleTextEditors.forEach((editor) => {
      const ext = extname(editor.document.fileName)
      const { document } = editor
      const source = document.getText()

      function tsTraverse(node: any, offset: number = 0) {
        if (isArrayLiteralExpression(node)) {
          node.elements.forEach((element, index) => {
            const start = document.positionAt(element.getStart() + offset)
            const decorator = createDecorator(`i:${index}`)
            decorators.push(decorator)
            editor.setDecorations(decorator, [new vscode.Range(start, start)])
          })
        }

        forEachChild(node, childNode => tsTraverse(childNode, offset))
      }

      if (['.js', '.ts', '.tsx', '.jsx'].includes(ext)) {
        const sourceFile = createSourceFile(
          editor.document.fileName,
          source,
          ScriptTarget.Latest,
          true,
        )

        tsTraverse(sourceFile)
      }
      else if (ext === '.vue') {
        const { descriptor } = parse(source)
        if (descriptor.scriptSetup) {
          const offset = descriptor.scriptSetup.loc.start.offset
          const sourceFile = createSourceFile(
            editor.document.fileName,
            descriptor.scriptSetup.content,
            ScriptTarget.Latest,
            true,
          )

          tsTraverse(sourceFile, offset)
        }
        else if (descriptor.script) {
          const offset = descriptor.script.loc.start.offset
          const sourceFile = createSourceFile(
            editor.document.fileName,
            descriptor.script.content,
            ScriptTarget.Latest,
            true,
          )

          tsTraverse(sourceFile, offset)
        }
      }
      else {
        vscode.window.showInformationMessage(`file type ${ext} is not supported yet.`)
        console.log(`file type ${ext} is not supported yet.`)
      }
    })
  }

  return {
    setDecorators,
    disposeDecorators,
    createDecorator,
    decorators,
  }
}
