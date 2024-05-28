import {
    type BinaryExpression,
    type Identifier,
    type IntegerLiteral,
    type Operator,
    type Program,
    type RealLiteral,
    type Statement,
    type UnaryExpression
} from "../types/astNodes";
import Scope from "./scope";
import { makeNull, makeNumber, type NumberValue, type RuntimeValue } from "../types/values";
import {LangCompileError} from "@/language/types/languageError";

export function evaluate(astNode: Statement, scope: Scope = new Scope()): RuntimeValue {
    switch (astNode.kind) {
        case "Program":
            return evaluateProgram(astNode as Program, scope)
        case "Operator": 
            return evaluateOperator(astNode as Operator, scope)
        case "BinaryExpression":
            return evaluateBinary(astNode as BinaryExpression, scope)
        case "Identifier":
            return evaluateIdentifier(astNode as Identifier, scope)
        case "UnaryExpression":
            return evaluateUnary(astNode as UnaryExpression, scope)
        case "IntegerLiteral":
            return evaluateInteger(astNode as IntegerLiteral)
        case "RealLiteral":
            return evaluateReal(astNode as RealLiteral)
        default:
            throw Error("Неизвестное выражение")
    }
}
function evaluateProgram(program: Program, scope: Scope): RuntimeValue {
    let lastEvaluated: RuntimeValue = makeNull()

    for (const statement of program.operators) {
        lastEvaluated = evaluate(statement, scope)
    }

    return lastEvaluated
}

function evaluateOperator(operation: Operator, scope: Scope): RuntimeValue {
    const value = evaluate(operation.rhs, scope)

    return scope.declareVariable(operation.identifier, value)
}

function evaluateIdentifier(identifier: Identifier, scope: Scope): RuntimeValue {
    return scope.lookupVariable(identifier.symbol)
}

function evaluateInteger(integer: IntegerLiteral): RuntimeValue {
    return makeNumber(integer.value)
}

function evaluateReal(integer: RealLiteral): RuntimeValue {
    return makeNumber(integer.value)
}

//TODO: THINK ABOUT BOOLEAN + NUMERIC || BOOLEAN + BOOLEAN || NUMERIC + NUMERIC
function evaluateUnary(unary: UnaryExpression, scope: Scope): RuntimeValue {
    const inner = evaluate(unary.inner, scope)
    switch (unary.operation.value) {
        case "-":
            return makeNumber(-toNumberValue(inner).value)
    }
    throw Error("Неизвестная унарная операция")
}

function evaluateBinary(binary: BinaryExpression, scope: Scope): RuntimeValue {
    const lhs = evaluate(binary.lhs, scope)
    const rhs = evaluate(binary.rhs, scope)

    switch (binary.operator.value) {
        case "+":
        case "-":
        case "*":
        case "^":
        case "/":
            if (toNumberValue(rhs).value === 0)
                throw new LangCompileError("Невозможно деление на 0", binary.operator)
            return evaluateBinaryNumbers(toNumberValue(lhs), toNumberValue(rhs), binary.operator.value)
        default:
            throw Error("Неизвестная бинарная операция " + binary.operator.value)
    }
}

function evaluateBinaryNumbers(lhs: NumberValue, rhs: NumberValue, operation: string) {
    switch (operation) {
        case "+":
            return makeNumber(lhs.value + rhs.value)
        case "-":
            return makeNumber(lhs.value - rhs.value)
        case "*":
            return makeNumber(lhs.value * rhs.value)
        case "/":
            return makeNumber(lhs.value / rhs.value)
        case "^":
            return makeNumber(Math.pow(lhs.value, rhs.value))
        default:
            throw Error("Неизвестная бинарная операция над числами")
    }
}

function toNumberValue(value: RuntimeValue): NumberValue {
    switch (value.type) {
        case "number":
            return makeNumber((value as NumberValue).value)
        default:
            throw Error("Невозможно привести тип к целочисленному")
    }
}
