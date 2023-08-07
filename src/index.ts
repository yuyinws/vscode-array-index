import * as vscode from 'vscode'
import { decorators } from './decorators'
import { displayStatusBar } from './statusBar'
import { debounce } from './utils'

const { setDecorators, disposeDecorators } = decorators()

const isShowInLoad = vscode.workspace.getConfiguration('vscode-array-index').get('isShowInLoad', false)

let isArrayIndexShow = isShowInLoad

export function activate(context: vscode.ExtensionContext) {
  isArrayIndexShow && setDecorators()
  displayStatusBar()

  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-array-index.toggleArrayIndex', () => {
      if (isArrayIndexShow) {
        isArrayIndexShow = false
        disposeDecorators()
      }
      else {
        isArrayIndexShow = true
        setDecorators()
      }
    }),
  )
}

vscode.workspace.onDidChangeTextDocument(
  debounce((event) => {
    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor && event.document === activeEditor.document && isArrayIndexShow) {
      disposeDecorators()
      setDecorators()
    }
  }, 500),
)

vscode.window.onDidChangeActiveTextEditor(() => {
  if (isArrayIndexShow) {
    disposeDecorators()
    setDecorators()
  }
})

export function deactivate() {}
