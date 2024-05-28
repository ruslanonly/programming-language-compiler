import {TokenType} from "../types/tokens";

export class LanguageSpecifics {
    static firstLetter = "A";
    static lastLetter = "Z";

    static firstNumber = "0";
    static lastNumber = "9";

    static skippables = [" ", "\t", String.fromCharCode(13)];

    static additives = ["+", "-"];
    static multiplicatives = ["*", "/"];
    static exponentiation = "^";

    static KEYWORDS: Record<string, TokenType> = {
        "begin": TokenType.StartKeyword,
        "end": TokenType.EndKeyword,
        "real": TokenType.RealKeyword,
        "integer": TokenType.IntegerKeyword,
    };

    static isAlphabetic(symbol: string): boolean {
        const upperSymbol = symbol.toUpperCase();
        return this.firstLetter <= upperSymbol && upperSymbol <= this.lastLetter;
    }

    static isNumeric(symbol: string): boolean {
        return this.firstNumber <= symbol && symbol <= this.lastNumber;
    }

    static isAlphanumeric(symbol: string): boolean {
        return this.isNumeric(symbol) || this.isAlphabetic(symbol);
    }

    static isSkipabble(symbol: string): boolean {
        return this.skippables.includes(symbol);
    }

    static isAdditiveOperator(symbol: string): boolean {
        return this.additives.includes(symbol);
    }

    static isMultiplicativeOperator(symbol: string): boolean {
        return this.multiplicatives.includes(symbol);
    }

    static isExponentiation(symbol: string): boolean {
        return symbol === this.exponentiation;
    }

    static reservedKeyword(str: string): TokenType | undefined {
        return this.KEYWORDS[str];
    }

    static isIdentifier(str: string): boolean {
        if (str.length < 1) return false;

        if (!this.isAlphabetic(str[0] || "")) return false;

        for (const char of str) {
            if (!this.isAlphanumeric(char)) return false;
        }
        return true;
    }
}