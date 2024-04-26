package main

import (
	"encoding/json"
	"go/ast"
	"go/parser"
	"go/token"
	"log"
	"os"
)

type pos struct {
	Index  int `json:"index"`
	Offset int `json:"offset"`
	Line   int `json:"line"`
	Column int `json:"column"`
}

func main() {
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, os.Args[1]+".go", nil, parser.ParseComments)
	if err != nil {
		log.Fatal(err)
	}
	arrays := [][]pos{}
	ast.Inspect(file, func(n ast.Node) bool {
		cl, ok := n.(*ast.CompositeLit)
		if ok {
			// Check if this composite literal represents an array.
			if _, ok := cl.Type.(*ast.ArrayType); ok {
				arr := make([]pos, 0, len(cl.Elts))

				// Output starting positions of each element.
				for i, elem := range cl.Elts {
					elemPos := fset.Position(elem.Pos())
					arr = append(arr, pos{
						Index:  i,
						Offset: elemPos.Offset,
						Line:   elemPos.Line,
						Column: elemPos.Column,
					})
				}
				arrays = append(arrays, arr)
			}
		}
		return true
	})

	bb, err := json.MarshalIndent(arrays, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	os.Stdout.Write(bb)
	os.Stdout.Write([]byte("\n"))
}
