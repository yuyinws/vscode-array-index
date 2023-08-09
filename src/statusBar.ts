import { extname } from 'node:path'
import * as vscode from 'vscode'

export function statusBar() {
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
  statusBar.text = 'Toogle [Index]'
  statusBar.command = 'vscode-array-index.toggleArrayIndex'
  function showOrHideBar() {
    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor && ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.json'].includes(extname(activeEditor.document.fileName)))
      statusBar.show()

    else
      statusBar.hide()
  }

  return {
    showOrHideBar,
  }
}
