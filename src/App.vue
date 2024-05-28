<script setup lang="ts">
import {onMounted, ref} from "vue";
import {SourceCode} from "@/programmingLang/lexer/sourceCode";
import {tokenize} from "@/programmingLang/lexer/tokenize";
import {Parser} from "@/programmingLang/parser/parser";
import Scope from "@/programmingLang/compiler/scope";
import {evaluate} from "@/programmingLang/compiler/compiler";
import {LangCompileError, LangSyntaxError} from "@/programmingLang/types/languageError";

const backdropRef = ref<HTMLDivElement>()
const highlightRef = ref<HTMLDivElement>()
const srcRef = ref<HTMLTextAreaElement>()

let output = ref<string>("")

let highlightInner = ref<string>("")

function highlightText() {
  if (!srcRef.value) return

  try {
    const source = new SourceCode(srcRef.value.value)
    const tokens = tokenize(source)
    console.log(JSON.stringify(tokens))
    const ast = new Parser(tokens).parse()

    const scope = new Scope()
    evaluate(ast, scope)

    let variablesLog = ""
    scope.variables.forEach((v: any,k: any) => {
      variablesLog += `${k} = ${v.value}\n`
    })
    output.value = variablesLog

  } catch (e) {
    let start = 0
    let end = 0
    switch ((e as Error).name) {
      case "CompileError": {
        const error = e as LangCompileError
        start = error.token.from
        end = error.token.to
        break
      }
      case "SyntaxError": {
        const error = e as LangSyntaxError
        start = error.from
        end = error.to
      }
    }
    const originalText = srcRef.value.value;

    const beforeHighlight = originalText.substring(0, start-1);
    const highlightedText = originalText.substring(start-1, end);
    const afterHighlight = originalText.substring(end);

    highlightInner.value = beforeHighlight + '<mark>' + highlightedText + '</mark>' + afterHighlight;
    output.value = (e as Error).message
  }
}

function updateScroll() {
  if (!srcRef.value) return
  const scrollY = srcRef.value.scrollTop
  const scrollX = srcRef.value.scrollLeft

  backdropRef.value?.scrollTo(scrollX, scrollY)
}

function clearMarks() {
  if (!srcRef.value) return
  highlightInner.value = srcRef.value.value
}

onMounted(() => {
  if (!srcRef.value) return
  highlightInner.value = srcRef.value.value
})

</script>

<template>
  <div class="wrapper">
    <div class="wrapper__left">
      <h1>Исходный код</h1>
      <div class="srcContainer">
        <div class="backdrop" ref="backdropRef">
          <div class="highlights" ref="highlightRef" v-html="highlightInner"></div>
        </div>
        <textarea @input="clearMarks" @scroll="updateScroll" ref="srcRef" autocomplete="off" autocapitalize="off" spellcheck="false">begin
real A B C
integer 1 2 3
1: A = 3.14
B = 2.71
33: X = 5
Y = 10
99: C = [(A + B * (B + (X + 2.5))) * 2]
Z = X ^ 2 + [(Y + C) * (Y - C) / [ (Y + C) * (Y - C) ]]
end</textarea>
      </div>
      <button class="pure-material-button-contained" @click="highlightText" style="margin-top: 10px;">Выполнить</button>
      <div class="output"><pre>Вывод:<br>{{output}}</pre></div>
    </div>
    <div class="wrapper__right">
      <h1>БНФ языка</h1>
      <div class="srcContainer">
        <textarea disabled>Язык = "begin" Определение ... Определение Оператор...Оператор "end"
Определение = "real" перем ... перем ! "integer" цел...цел
Оператор = </Метка ":"/> перем "=" ПраваяЧасть
ПраваяЧасть = </"-"/> Блок1["+" ! "-"] ... Блок1
Блок1 = Блок2["*" ! "/"] ... Блок2
Блок2 = Блок3 "^" ... Блок3
Блок3 = перем ! веществ ! "(" ПраваяЧасть ")" ! "[" ПраваяЧасть "]" (максимальное количество вложенных квадратных скобок[] = 2)
веществ = цел "." цел
цел = Ц ... Ц
перем = Буква</ Слово...Слово/>
Слово = Б!Ц
Б = "A" ! "B" ! "C" ! ... ! "Z"
Ц = "0" ! "1" ! "2" ! ... ! "9"
        </textarea>
      </div>
    </div>
  </div>
</template>

<style>

  .wrapper {
    display: flex;
    flex-direction: row;
    gap: 30px;
    padding: 40px;
    border-radius: 20px;
    box-shadow: rgba(0, 0, 0, 0.1) 0 1px 20px;
  }
  
  .wrapper__left, .wrapper__right {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .backdrop, textarea, .srcContainer {
    width: 500px;
    height: 400px;
  }

  .highlights, textarea {
    padding: 10px;
    font: 14px/20px 'Open Sans', sans-serif;
    letter-spacing: 1px;
  }

  .backdrop {
    position: absolute;
    z-index: 1;
    background-color: #fff;
    overflow: auto;
    pointer-events: none;
    transition: transform 1s;
  }

  .highlights {
    white-space: pre-wrap;
    word-wrap: break-word;
    color: transparent;
  }

  textarea {
    display: block;
    position: absolute;
    z-index: 2;
    margin: 0;
    border-radius: 10px;
    color: #444;
    background-color: transparent;
    overflow: auto;
    resize: none;
    transition: transform 1s;
  }

  mark {
    border-radius: 3px;
    color: transparent;
    background-color: rgba(255, 89, 89, 0.37);
    text-decoration: red underline wavy;
  }

  pre {
    border: 2px solid #74637f;
    margin-top: 5px;
    padding: 10px;
    border-radius: 10px;
  }
</style>
