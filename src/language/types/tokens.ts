export interface Token {
    value: string,
    type: TokenType,
    from: number,
    to: number,
    isSpaceBefore?: boolean
}

export enum TokenType {
    StartKeyword = 'StartKeyword',
    EndKeyword = 'EndKeyword',
    RealKeyword = 'RealKeyword',
    IntegerKeyword = 'IntegerKeyword',
    Real = 'Real',
    Integer = 'Integer',
    Identifier = 'Identifier',
    Equals = 'Equals',
    Colon = 'Colon',
    AdditiveOperator = 'AdditiveOperator',
    MultiplicativeOperator = 'MultiplicativeOperator',
    Exponentiation = 'Exponentiation',
    LeftParen = 'LeftParen',
    RightParen = 'RightParen',
    LeftBracket = 'LeftBracket',
    RightBracket = 'RightBracket',
    NewLine = 'NewLine',
    EOF = 'EOF'
}