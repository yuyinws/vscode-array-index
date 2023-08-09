import * as vscode from 'vscode'
import { decorators } from './decorators'
import { debounce } from './utils'
import { statusBar } from './statusBar'

const { setDecorators, disposeDecorators } = decorators()
const { showOrHideBar } = statusBar()

const isShowInLoad = vscode.workspace.getConfiguration('vscode-array-index').get('isShowInLoad', false)

let isArrayIndexShow = isShowInLoad

export function activate(context: vscode.ExtensionContext) {
  isArrayIndexShow && setDecorators()
  showOrHideBar()
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
  showOrHideBar()
  if (isArrayIndexShow) {
    disposeDecorators()
    setDecorators()
  }
})

export function deactivate() {}
