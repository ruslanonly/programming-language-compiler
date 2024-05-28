import {TokenType, type Token} from "../types/tokens";
import {LanguageSpecifics} from "./languageSpecifics";
import {SourceCode} from "./sourceCode";
import {LangSyntaxError} from "../types/languageError";

export function tokenize(sourceCode: SourceCode): Token[] {
    const tokens: Token[] = [];

    let isSpaceBefore = false;
    let startOfStatement = 0;
    while (!sourceCode.isLast()) {
        if (sourceCode.isNextSkipabble()) {
            sourceCode.consume();
            isSpaceBefore = true;
            continue;
        }
        if (sourceCode.peek() === "\n") {
            tokens.push({
                type: TokenType.NewLine,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: startOfStatement,
                to: sourceCode.currentSymbol
            });
            startOfStatement = sourceCode.currentSymbol;
        } else if (sourceCode.peek() === "=") {
            tokens.push({
                type: TokenType.Equals,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.peek() === ":") {
            tokens.push({
                type: TokenType.Colon,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.peek() === "(") {
            tokens.push({
                type: TokenType.LeftParen,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.peek() === ")") {
            tokens.push({
                type: TokenType.RightParen,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.peek() === "[") {
            tokens.push({
                type: TokenType.LeftBracket,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.peek() === "]") {
            tokens.push({
                type: TokenType.RightBracket,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.isNextAdditiveOperator()) {
            tokens.push({
                type: TokenType.AdditiveOperator,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.isNextMultiplicativeOperator()) {
            tokens.push({
                type: TokenType.MultiplicativeOperator,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else if (sourceCode.isNextExponentiation()) {
            tokens.push({
                type: TokenType.Exponentiation,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            });
        } else {
            if (sourceCode.isNextNumeric()) {
                let value = "";
                while (sourceCode.isNextNumeric()) {
                    value += sourceCode.consume();
                }
                if (sourceCode.peek() === ".") {
                    value += sourceCode.consume();
                    while (sourceCode.isNextNumeric()) {
                        value += sourceCode.consume();
                    }
                    tokens.push({
                        type: TokenType.Real,
                        value,
                        isSpaceBefore,
                        from: sourceCode.currentSymbol - value.length,
                        to: sourceCode.currentSymbol
                    });
                } else {
                    tokens.push({
                        type: TokenType.Integer,
                        value,
                        isSpaceBefore,
                        from: sourceCode.currentSymbol - value.length,
                        to: sourceCode.currentSymbol
                    });
                }
            } else if (sourceCode.isNextAlphanumeric()) {
                let value = "";
                while (sourceCode.isNextAlphanumeric()) {
                    value += sourceCode.consume();
                }

                const reserved = LanguageSpecifics.reservedKeyword(value);

                if (reserved != undefined) {
                    tokens.push({
                        type: reserved,
                        value,
                        isSpaceBefore,
                        from: sourceCode.currentSymbol - value.length,
                        to: sourceCode.currentSymbol
                    });
                } else if (LanguageSpecifics.isIdentifier(value)) {
                    tokens.push({
                        type: TokenType.Identifier,
                        value,
                        isSpaceBefore,
                        from: sourceCode.currentSymbol - value.length,
                        to: sourceCode.currentSymbol
                    });
                } else {
                    throw new LangSyntaxError(`Неизвестная переменная '${value}'`, sourceCode.currentSymbol - value.length, sourceCode.currentSymbol);
                }
            } else {
                throw new LangSyntaxError(`Неизвестный символ ${sourceCode.peek()} (${sourceCode.consume().charCodeAt(0)})`, sourceCode.currentSymbol, sourceCode.currentSymbol);
            }
        }
        isSpaceBefore = false;
    }
    tokens.push({
        type: TokenType.EOF,
        value: "",
        from: sourceCode.currentSymbol,
        to: sourceCode.currentSymbol
    });

    return tokens;
}