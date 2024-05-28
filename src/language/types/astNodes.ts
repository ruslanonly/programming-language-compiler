import {type Token} from './tokens'
export type NodeType =
    "Program"
    | "Definition"
    | "Operator"
    | "BinaryExpression"
    | "Identifier"
    | "IntegerLiteral"
    | "RealLiteral"
    | "UnaryExpression"

export interface Statement {
    kind: NodeType
}

export interface Program extends Statement {
    kind: "Program"
    definitions: Definition[]
    operators: Operator[]
}

export interface Expression extends Statement {
}

export interface BinaryExpression extends Expression {
    kind: "BinaryExpression"
    lhs: Expression;
    rhs: Expression;
    operator: Token
}

export interface Identifier extends Expression {
    kind: "Identifier"
    symbol: Token
}

export interface IntegerLiteral extends Expression {
    kind: "IntegerLiteral"
    value: number
}

export interface RealLiteral extends Expression {
    kind: "RealLiteral"
    value: number
}

export interface Definition extends Statement {
    kind: "Definition"
    type: Token,
    variables: Identifier[],
    integers: IntegerLiteral[]
}

export interface Operator extends Statement {
    kind: "Operator",
    label?: Token,
    identifier: Token,
    rhs: Expression
}

export interface UnaryExpression extends Expression {
    kind: "UnaryExpression",
    operation: Token,
    inner: Expression
}