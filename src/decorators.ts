import * as child_process from 'node:child_process'
import { extname } from 'pathe'
import * as vscode from 'vscode'
import { ScriptTarget, createSourceFile, forEachChild, isArrayLiteralExpression } from 'typescript'
import { parse } from '@vue/compiler-sfc'
import { parse as parseSvelte, walk } from 'svelte/compiler'
import { parse as parseJSON, traverse } from '@humanwhocodes/momoa'
import { GO_PARSER_PATH } from './utils'

const channel = vscode.window.createOutputChannel('vscode-array-index')

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
      try {
        const ext = extname(editor.document.fileName)
        const { document } = editor
        const source = document.getText()

        function createIndexDecorator(position: vscode.Position, index: number) {
          const decorator = createDecorator(`i:${index}`)
          decorators.push(decorator)
          editor.setDecorations(decorator, [new vscode.Range(position, position)])
        }

        function markArrayLiteralsInGolang(document: vscode.TextDocument) {
          const filePath = document.fileName.substring(0, document.fileName.length - 3)

          const goToolsGopath = vscode.workspace.getConfiguration('go').toolsGopath ?? ''

          let goBinPath = 'go' // Maybe check ext fot windows?
          if (goToolsGopath !== '')
            goBinPath = `${goToolsGopath}/${goBinPath}`

          const child = child_process.spawn(goBinPath, ['run', GO_PARSER_PATH, filePath])

          child.stdout.on('data', (data) => {
            try {
              const result = JSON.parse(data.toString())
              for (const arr of result) {
                for (const el of arr) {
                  const pos = new vscode.Position(el.line - 1, el.column - 1)
                  createIndexDecorator(pos, el.index)
                }
              }
            }
            catch (err) {
              channel.append(`Error: ${err}`)
            }
          })
          child.stderr.on('data', data => channel.append(`go stderr:${data.toString()}`))
          child.on('error', data => channel.append(`go error:${data.toString()}`))
        }

        function tsTraverse(node: any, offset: number = 0) {
          if (isArrayLiteralExpression(node)) {
            node.elements.forEach((element, index) => {
              const start = document.positionAt(element.getStart() + offset)
              createIndexDecorator(start, index)
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
        else if (ext === '.go') {
          markArrayLiteralsInGolang(document)
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
        else if (ext === '.svelte') {
          const ast = parseSvelte(source) as unknown as any
          walk(ast, {
            enter(node) {
              if (node.type === 'ArrayExpression') {
                node.elements.forEach((element, index) => {
                  // @ts-expect-error anyway
                  const start = document.positionAt(element?.start)
                  createIndexDecorator(start, index)
                })
              }
            },
          })
        }
        else if (ext === '.json') {
          const ast = parseJSON(source)
          console.log('json traverser', ast)

          traverse(ast, {
            enter(node: any) {
              if (node.type === 'Array') {
                node.elements.forEach((element: any, index: number) => {
                  const start = document.positionAt(element.loc.start.offset)
                  createIndexDecorator(start, index)
                })
              }
            },
          })
        }
        else {
          channel.append(`file type ${ext} is not supported yet.`)
        }
      }
      catch (error) {
        console.log('Parse Error:', error)
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
