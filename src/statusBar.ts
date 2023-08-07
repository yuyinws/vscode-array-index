import * as vscode from 'vscode'

export function displayStatusBar() {
  // 注意保存此对象以更新文案，控制显示与否等
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
  statusBar.text = 'Toogle [Index]'
  statusBar.tooltip = 'Toggle Array Index'
  // 点击相应事件，绑定对应command的标识
  statusBar.command = 'vscode-array-index.toggleArrayIndex'
  statusBar.show()
}
