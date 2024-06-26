export type ValueType = "number" | "boolean" | "null"

export interface RuntimeValue {
    type: ValueType
}

export interface NumberValue extends RuntimeValue {
    type: "number",
    value: number
}

export function makeNumber(value: number): NumberValue {
    return {type: "number", value} as NumberValue
}

export interface NullValue extends RuntimeValue {
    type: "null",
    value: null
}

export function makeNull(): NullValue {
    return {type: "null", value: null} as NullValue
}