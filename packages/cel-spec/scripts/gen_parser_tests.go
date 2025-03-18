// Copyright 2024-2025 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path"
	"reflect"
	"strconv"
	"strings"

	goast "go/ast"
	goparser "go/parser"
	gotoken "go/token"

	"github.com/google/cel-go/common"
	"github.com/google/cel-go/common/ast"
	"github.com/google/cel-go/common/debug"
	"github.com/google/cel-go/common/types"
	"github.com/google/cel-go/parser"
)

type ParserTest struct {
	Expression string `json:"expr"`
	Ast        string `json:"ast,omitempty"`
	Error      string `json:"error,omitempty"`
}

const celGoModule = "github.com/google/cel-go"

// Examples:
// go run ./main.go -output=parser.json parser/parser_test.go
// go run ./main.go -output=comprehensions.ts ext/comprehensions_test.go
func main() {
	goModPath := flag.String("gomod", "go.mod", "path to the go mod file for resolving from the go module cache")
	outputPath := flag.String("output", "output.json", "write result to file")
	flag.Parse()
	if len(flag.Args()) != 1 {
		log.Fatalf("must provide path to a cel-go source file")
	}
	sourceFile := flag.Args()[0]
	file, sourceId, err := parseCelGoSourceFile(*goModPath, flag.Args()[0])
	if err != nil {
		log.Fatalf("failed to parse source: %v", err)
	}
	var filter func(file *goast.File) ([]string, error)
	if strings.HasSuffix(sourceFile, "parser_test.go") {
		filter = findParserTestExpressions
	} else if strings.HasSuffix(sourceFile, "comprehensions_test.go") {
		filter = findComprehensionTestExpressions
	} else {
		log.Fatalf("do not know what to extract from %s", sourceFile)
	}
	expressions, err := filter(file)
	if err != nil {
		log.Fatalf("failed to extract expressions: %v", err)
	}
	parserTests, err := parseExpressions(expressions)
	if err != nil {
		log.Fatalf("failed to parse expressions: %v", err)
	}
	err = write(parserTests, sourceId, *outputPath)
	if err != nil {
		log.Fatalf("failed to write output: %v", err)
	}
}

func parseExpressions(expressions []string) ([]*ParserTest, error) {
	celParser, err := parser.NewParser(
		parser.Macros(parser.AllMacros...),
		parser.MaxRecursionDepth(32),
		parser.ErrorRecoveryLimit(4),
		parser.ErrorRecoveryLookaheadTokenLimit(4),
		parser.PopulateMacroCalls(true),
		parser.EnableVariadicOperatorASTs(true),
	)
	if err != nil {
		return nil, err
	}
	var parserTests []*ParserTest
	for _, test := range expressions {
		result := exprToParserTest(celParser, test)
		if result != nil {
			parserTests = append(parserTests, result)
		}
	}
	return parserTests, nil
}

func exprToParserTest(p *parser.Parser, expression string) *ParserTest {
	s := common.NewTextSource(expression)
	a, errors := p.Parse(s)
	if len(errors.GetErrors()) == 0 {
		return &ParserTest{
			expression,
			debug.ToAdornedDebugString(
				a.Expr(),
				&kindAdorner{},
			),
			"",
		}
	} else {
		return &ParserTest{
			expression,
			"",
			errors.ToDisplayString(),
		}
	}
}

type kindAdorner struct {
	sourceInfo *ast.SourceInfo
}

func (k *kindAdorner) GetMetadata(elem any) string {
	switch e := elem.(type) {
	case ast.Expr:
		if macroCall, found := k.sourceInfo.GetMacroCall(e.ID()); found {
			return fmt.Sprintf("^#%s#", macroCall.AsCall().FunctionName())
		}
		var valType string
		switch e.Kind() {
		case ast.CallKind:
			valType = "*expr.Expr_CallExpr"
		case ast.ComprehensionKind:
			valType = "*expr.Expr_ComprehensionExpr"
		case ast.IdentKind:
			valType = "*expr.Expr_IdentExpr"
		case ast.LiteralKind:
			lit := e.AsLiteral()
			switch lit.(type) {
			case types.Bool:
				valType = "*expr.Constant_BoolValue"
			case types.Bytes:
				valType = "*expr.Constant_BytesValue"
			case types.Double:
				valType = "*expr.Constant_DoubleValue"
			case types.Int:
				valType = "*expr.Constant_Int64Value"
			case types.Null:
				valType = "*expr.Constant_NullValue"
			case types.String:
				valType = "*expr.Constant_StringValue"
			case types.Uint:
				valType = "*expr.Constant_Uint64Value"
			default:
				valType = reflect.TypeOf(lit).String()
			}
		case ast.ListKind:
			valType = "*expr.Expr_ListExpr"
		case ast.MapKind, ast.StructKind:
			valType = "*expr.Expr_StructExpr"
		case ast.SelectKind:
			valType = "*expr.Expr_SelectExpr"
		}
		return fmt.Sprintf("^#%s#", valType)
	case ast.EntryExpr:
		return fmt.Sprintf("^#%s#", "*expr.Expr_CreateStruct_Entry")
	}
	return ""
}

// Parse a GO file from the cel-go module in the module cache, honoring the version
// pinned in go-mod.
// For example, readCelGoSourceFile("go.mod", "parser/parser_test.go") parses the
// file $GOMODCACHE/github.com/google/cel-go@v0.22.2-0.20241217215216-98789f34a481/parser/parser_test.go
func parseCelGoSourceFile(goModPath string, filePath string) (*goast.File, string, error) {
	goMod, err := os.ReadFile(goModPath)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read go.mod: %w", err)
	}
	ver := string(goMod)
	i := strings.Index(ver, celGoModule)
	if i < 0 {
		return nil, "", fmt.Errorf("%s not in go.mod", celGoModule)
	}
	ver = ver[i+len(celGoModule)+1:]
	i = strings.Index(ver, "\n")
	if i < 0 {
		return nil, "", fmt.Errorf("unexpected go.mod structure")
	}
	ver = ver[:i]
	goModCache := os.Getenv("GOMODCACHE")
	if goModCache == "" {
		goPath := os.Getenv("GOPATH")
		if goPath == "" {
			return nil, "", fmt.Errorf("cannot resolve go module cache, GOPATH and GOMODCACHE empty")
		}
		goModCache = path.Join(goPath, "pkg/mod")
	}
	celGoModulePath := path.Join(goModCache, celGoModule+"@"+ver)
	_, err = os.Stat(celGoModulePath)
	if err != nil {
		return nil, "", fmt.Errorf("cannot resolve %s %s in go module cache: %w", celGoModule, ver, err)
	}
	celGoFilePath := path.Join(celGoModulePath, filePath)
	fileData, err := os.ReadFile(celGoFilePath)
	if err != nil {
		return nil, "", fmt.Errorf("cannot resolve %s in %s: %w", filePath, celGoModulePath, err)
	}
	fset := gotoken.NewFileSet()
	file, err := goparser.ParseFile(fset, filePath, fileData, goparser.SkipObjectResolution)
	if err != nil {
		return nil, "", err
	}
	return file, celGoModule + "@" + ver + "/" + filePath, nil
}

// Find CEL expressions from cel-go's comprehensions_test.go
// Returns the unquoted string values from each `expr` defined in a `Test` func.
// See https://github.com/google/cel-go/blob/98789f34a481044a0ad4b8a77f298d2ec3623bdb/ext/comprehensions_test.go
func findComprehensionTestExpressions(file *goast.File) ([]string, error) {
	var inputs []string
	for _, decl := range file.Decls {
		funcDecl, ok := decl.(*goast.FuncDecl)
		if !ok {
			continue
		}
		if !strings.HasPrefix(funcDecl.Name.Name, "Test") {
			continue
		}
		if len(funcDecl.Body.List) < 1 {
			continue
		}
		assign, ok := funcDecl.Body.List[0].(*goast.AssignStmt)
		if !ok {
			continue
		}
		for _, rhs := range assign.Rhs {
			compLit, ok := rhs.(*goast.CompositeLit)
			if !ok {
				continue
			}
			for _, expr := range compLit.Elts {
				compLit, ok := expr.(*goast.CompositeLit)
				if !ok {
					continue
				}
				for _, expr := range compLit.Elts {
					keyValueExpr, ok := expr.(*goast.KeyValueExpr)
					if !ok {
						continue
					}
					keyIdent, ok := keyValueExpr.Key.(*goast.Ident)
					if !ok {
						continue
					}
					if keyIdent.Name != "expr" {
						continue
					}
					valLit, ok := keyValueExpr.Value.(*goast.BasicLit)
					if !ok {
						continue
					}
					unquotedInput, err := strconv.Unquote(valLit.Value)
					if err != nil {
						return nil, fmt.Errorf("cannot unquote %s: %w", valLit.Value, err)
					}
					inputs = append(inputs, unquotedInput)
				}
			}
		}
	}
	return inputs, nil
}

// Find CEL expressions from cel-go's parser_test.go
// Returns the unquoted string values from each `testInfo.I` of the `testCases`
// slice.
// See https://github.com/google/cel-go/blob/98789f34a481044a0ad4b8a77f298d2ec3623bdb/parser/parser_test.go
func findParserTestExpressions(file *goast.File) ([]string, error) {
	var inputs []string
	for _, decl := range file.Decls {
		genDecl, ok := decl.(*goast.GenDecl)
		if !ok {
			continue
		}
		for _, spec := range genDecl.Specs {
			valueSpec, ok := spec.(*goast.ValueSpec)
			if !ok {
				continue
			}
			for _, name := range valueSpec.Names {
				if name.Name != "testCases" {
					continue
				}
				for _, value := range valueSpec.Values {
					valueCompositeLit, ok := value.(*goast.CompositeLit)
					if !ok {
						continue
					}
					for _, expr := range valueCompositeLit.Elts {
						exprCompositeLit, ok := expr.(*goast.CompositeLit)
						if !ok {
							continue
						}
						for _, expr := range exprCompositeLit.Elts {
							keyValueExpr, ok := expr.(*goast.KeyValueExpr)
							if !ok {
								continue
							}
							keyIdent, ok := keyValueExpr.Key.(*goast.Ident)
							if !ok {
								continue
							}
							if keyIdent.Name != "I" {
								continue
							}
							valLit, ok := keyValueExpr.Value.(*goast.BasicLit)
							if !ok {
								continue
							}
							unquotedInput, err := strconv.Unquote(valLit.Value)
							if err != nil {
								return nil, fmt.Errorf("cannot unquote %s: %w", valLit.Value, err)
							}
							inputs = append(inputs, unquotedInput)
						}
					}
				}
			}
		}
	}
	return inputs, nil
}

func write(parserTests []*ParserTest, sourceId string, outputPath string) error {
	var output []byte
	if strings.HasSuffix(outputPath, ".ts") {
		buf := strings.Builder{}
		buf.WriteString("// Generated from cel-go " + sourceId + "\n")
		buf.WriteString("export const parserTests = ")
		j, _ := json.Marshal(parserTests)
		buf.Write(j)
		buf.WriteString(" as const;\n")
		output = []byte(buf.String())
	} else {
		output, _ = json.Marshal(parserTests)
	}
	return os.WriteFile(outputPath, output, 0644)
}
