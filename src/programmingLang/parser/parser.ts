import {type Token, TokenType} from '../types/tokens'
import type {
    BinaryExpression,
    Definition,
    Expression,
    RealLiteral,
    Identifier,
    IntegerLiteral,
    Operator,
    Program,
    UnaryExpression
} from '../types/astNodes.js'
import {LangCompileError} from "../types/languageError";

export class Parser {
    tokens: Token[] = []
    lastConsumedToken: Token | undefined

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    consume(): Token {
        this.lastConsumedToken = this.tokens.shift() as Token
        return this.lastConsumedToken
    }

    peek(where = 0): Token {
        return this.tokens[where] as Token
    }

    typeMatches(where: number, ...tokenTypes: TokenType[]): boolean {
        let currentToken = this.peek(where)
        if (!currentToken || !tokenTypes.includes(currentToken.type)) {
            return false
        }
        return true
    }

    typeMatchesStatement(where: number, ...tokenTypes: TokenType[]) {
        this.skipNewLines()
        return this.typeMatches(where, ...tokenTypes)
    }

    expect(err: string, ...tokenTypes: TokenType[]): Token {
        const previousToken = this.lastConsumedToken
        const currentToken = this.consume()

        if (!currentToken || !tokenTypes.includes(currentToken.type)) {
            if (currentToken.type === TokenType.NewLine) {
                throw new LangCompileError(err, previousToken!)
            }
            throw new LangCompileError(err, currentToken)
        }

        return currentToken
    }

    expectNewStatement(err: string) {
        this.skipNewLines()
        if (this.lastConsumedToken != undefined && this.lastConsumedToken.type != TokenType.NewLine) {
            throw new LangCompileError(err, this.peek())
        }
    }

    skipNewLines() {
        while (this.peek().type === TokenType.NewLine) {
            this.consume()
        }
    }

    parse(): Program {
        const program: Program = {
            kind: "Program",
            definitions: [],
            operators: []
        }

        this.expect("Программа должна начинаться со ключевого слова 'begin'", TokenType.StartKeyword)
        while (this.typeMatchesStatement(0, TokenType.RealKeyword, TokenType.IntegerKeyword)) {
            this.expectNewStatement("Определения должны быть описаны на новой строчке")
            program.definitions.push(this.parseDefinition())
        }

        this.skipNewLines()
        while (this.typeMatches(0, TokenType.Integer) || this.typeMatches(0, TokenType.Identifier)) {
            this.expectNewStatement("Определения должны быть описаны на новой строчке")
            program.operators.push(this.parseOperator())
            this.skipNewLines()
        }

        this.expectNewStatement("Программа должна заканчиваться со ключевого слова 'end'")
        this.expect("Программа должна заканчиваться со ключевого слова 'end'", TokenType.EndKeyword)
        this.expect("Нельзя использовать другие символы после 'end'", TokenType.EOF)

        return program
    }

    parseDefinition(): Definition {
        const token = this.expect("Определения должны начинаться с ключевого слова 'real' или 'integer'", TokenType.RealKeyword, TokenType.IntegerKeyword)
        const variables: Identifier[] = []
        const integers: IntegerLiteral[] = []

        if (token.type === TokenType.RealKeyword) {
            do {
                variables.push(this.parseIdentifier())
            } while (this.typeMatches(0, TokenType.Identifier))
        } else {
            do {
                integers.push(this.parseIntegerLiteral())
            } while (this.typeMatches(0, TokenType.Integer))
        }

        this.expect("Определения должны заканчиваться переходом на новую строку", TokenType.NewLine)

        return {
            kind: "Definition",
            type: token,
            variables: variables,
            integers
        }
    }

    parseOperator(): Operator {
        const label = this.typeMatches(0, TokenType.Integer) ? this.consume() : undefined

        if (label) {
            this.expect("После метки должен следовать терминатор ':'", TokenType.Colon)
        }

        const identifier = this.expect("Оператор должен начинаться с переменной", TokenType.Identifier)

        this.expect("Оператор должен иметь терминатор '='", TokenType.Equals)

        const rhs = this.parseExpression()

        return {
            kind: "Operator",
            label: label,
            identifier: identifier,
            rhs: rhs
        }
    }

    parseExpression(): Expression {
        return this.parseAddition()
    }

    parseAddition(): Expression {
        let operation: Token | null = null
        if (this.peek().value === "-") {
            operation = this.consume()
        }
        let left = this.parseMultiplication()
        if (operation) {
            left = {kind: "UnaryExpression", inner: left, operation: operation} as UnaryExpression
        }
        while (this.typeMatches(0, TokenType.AdditiveOperator)) {
            const operator = this.consume()
            const right = this.parseMultiplication()
            left = {
                kind: "BinaryExpression",
                lhs: left,
                rhs: right,
                operator
            } as BinaryExpression
        }
        return left
    }

    parseMultiplication(): Expression {
        let left = this.parseExponentiation()
        while (this.typeMatches(0, TokenType.MultiplicativeOperator)) {
            const operator = this.consume()
            const right = this.parseExponentiation()
            left = {
                kind: "BinaryExpression",
                lhs: left,
                rhs: right,
                operator
            } as BinaryExpression
        }
        return left
    }

    parseExponentiation(): Expression {
        let left = this.parsePrimary()
        while (this.typeMatches(0, TokenType.Exponentiation)) {
            const operator = this.consume()
            const right = this.parsePrimary()
            left = {
                kind: "BinaryExpression",
                lhs: left,
                rhs: right,
                operator
            } as BinaryExpression
        }
        return left
    }

    parsePrimary(): Expression {
        switch (this.peek().type) {
            case TokenType.Integer:
                return this.parseIntegerLiteral()
            case TokenType.Real:
                return this.parseRealLiteral()
            case TokenType.Identifier:
                return this.parseIdentifier()
            case TokenType.LeftBracket: {
                this.consume()
                const expr = this.parseExpression()
                this.expect("Не хватает квадратной закрывающей скобки", TokenType.RightBracket)
                return expr
            }
            case TokenType.LeftParen: {
                this.consume()
                const expr = this.parseExpression()
                this.expect("Не хватает круглой закрывающей скобки", TokenType.RightParen)
                return expr
            }
            default:
                throw new LangCompileError(`Неизвестный элемент: ${this.peek().value}`, this.peek())
        }
    }

    parseIdentifier(): Identifier {
        const symbol = this.expect("Ожидалась переменная", TokenType.Identifier)
        return {kind: "Identifier", symbol}
    }

    parseIntegerLiteral(): IntegerLiteral {
        const token = this.expect("Ожидалось целое число", TokenType.Integer)
        return {kind: "IntegerLiteral", value: parseInt(token.value, 10)}
    }

    parseRealLiteral(): RealLiteral {
        const token = this.expect("Ожидалось вещественное число", TokenType.Real)
        return {kind: "RealLiteral", value: parseFloat(token.value)}
    }
}