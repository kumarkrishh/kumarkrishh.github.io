import React from 'react';

import Section from '../components/Section';
import HrefLink from '../components/HrefLink';
import ArticleLayout from '../components/ArticleLayout';

import AsideCard from '../components/AsideCard';

import { Prism as SyntaxHighligher } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import LasagnaLogo from "../assets/projects/lasagna.png";
import LasagnaFizzbuzzTxtUrl from "../assets/projects/lasagna_fizzbuzz.txt?url";

import outdent from 'outdent';

import { ArticleLink } from '../components/Articles';
import { articleData } from '../components/ArticleData';

const LasagnaPage = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>

    <Section id="lasagna" name="Lasagna">
      <p>
        Very small stack based programming language.
      </p>
      <img src={LasagnaLogo} className="border border-dark d-block mx-auto mb-5" style={{ width: "30rem" }} alt="Lasagna Logo" />
      <h4>Motivation</h4>
      <p>
        I created Lasagna mostly for fun, but also to try my hand at writing a very simple intepreter in C.
        The entire source code (at time of writing) is only 824 lines of C, and could easily be compressed further while maintaining readability.
      </p>
      <p>
        The language is very similar to <a href="https://en.wikipedia.org/wiki/Forth_(programming_language)">Forth</a>,
        which similarly uses a stack to store arguments for functions.
      </p>
      <p>
        It shares with <a href="https://en.wikipedia.org/wiki/Lisp_(programming_language)">Lisp</a> the property
        of <a href="https://en.wikipedia.org/wiki/Homoiconicity">homoiconicity</a>.
        This means that a program written in Lasagna treats its own code as data.
        Lisp accomplishes this using lists, which means any Lisp code can be represented as a list.
        Lasagna uses strings for this purpose.
      </p>
      <p>
        Lasagna syntax uses code stored in strings heavily, for loops, if statements, and other control structures.
        The string syntax is somewhat inspired by Lisp, since we use parentheses instead of double quotes.
      </p>
      <h4>Name/Logo Explanation</h4>
      <p>
        It's named Lasagna due to its stack based nature.
        Just as a lasagna has many delicious pasta layers, the executing program will also have layers of tasty strings and numbers.
      </p>
      <p>
        The logo is remniscent of a famous cartoon cat who is notoriously fond of lasagna.
      </p>
    </Section>
    <Section id="usage" name="How to Use">
      <h4>Building the Interpreter</h4>
      <p>
        The source code is located here: <HrefLink href="https://github.com/pimpale/lasagna" />
      </p>
      <p>
        First, ensure that you have <a href="https://en.wikipedia.org/wiki/Clang">Clang</a> installed,
        as well as <a href="https://en.wikipedia.org/wiki/Make_(software)">make</a> and <a href="https://en.wikipedia.org/wiki/Find_(Unix)">find</a>.
      </p>
      <p>
        Then, clone the repository, and from within the top level folder run:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>
        make
      </SyntaxHighligher>
      <h4>Running the Interpreter</h4>
      <p>
        After compilation, the interpreter binary will be located at <code>obj/lasagna</code>.
      </p>
      <p>
        To get an interactive shell, run:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>
        ./obj/lasagna
      </SyntaxHighligher>
      <p>
        To execute a Lasagna script, do:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>
        {"./obj/lasagna <FILENAME>"}
      </SyntaxHighligher>
    </Section>

    <Section id="guide" name="Language Guide">
      <p>
        This language is based entirely on the stack and string. Some examples:
      </p>
      <h4>hello world</h4>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>
        {"(hello world) print"}
      </SyntaxHighligher>
      <p>
        This prints hello world. Instead of the <code>"</code> character, <code>(</code> and <code>)</code> are used to represent strings, and can be nested.
        The string is pushed onto the stack character by character, with a leading and terminating null byte.
        <code>printstr</code> is one of a few built in functions defined in src/functions.c
      </p>

      <h4>Comments</h4>
      <p>
        Comments go from a <code>#</code> to the end of the line, and can be defined anywhere (even in a string).
        To include a literal <code>#</code> in the string, use a backslash.
      </p>
      <p className="mb-4">
        Some examples of usage:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        (hello
        # This is a comment
        world) println
      `}</SyntaxHighligher>
      <p>
        This code would print out:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        hello
        world
      `}</SyntaxHighligher>
      <p>
        However, if we escape the hash, it would be:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        (hello
        \# This is a comment
        world) println
      `}</SyntaxHighligher>
      <p>
        This results in
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        hello
        # This is a comment
        world
      `}</SyntaxHighligher>
      <h4>Math</h4>
      <p>
        For the most part, math is pretty self explanatory.
        Due to technical limitations, all numbers right now are unsigned 8 bit integers.
        Therefore, numeric literals must be positive integers less than 255.
      </p>
      <p>
        Example:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        1 2 +u8 print8
      `}</SyntaxHighligher>
      <p>
        Execution of the program is left to right.
        So, this program pushes the bytes 1 and 2, sums them, and prints the result.
      </p>
      <h4>Eval</h4>
      <p>
        A very important function in Lasagna is <code>eval</code>, since it's used as a building block for many other control statements.
        This function takes in a string stored on the stack, and evaluates it as Lasagna source code.
      </p>
      <p>
        Let's look at a somewhat contrived example:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        ((one level deep) print) eval
      `}</SyntaxHighligher>
      <p>
        Since parentheses can be nested, it's not a problem that we have strings inside other strings.
        What happens is that when the branch is evaluated, the inner string will be pushed onto the stack.
        In this example, we first see the string <code>((one level deep) print)</code> and push it onto the stack.
        We then reach the <code>eval</code> function, which pops the string off the stack and begins executing it as code.
        This causes <code>one level deep</code> to be pushed to the stack.
        We then execute the <code>print</code> function, which pops the string and prints it out.
      </p>
      <p>
        So, this fragment will output:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        one level deep
      `}</SyntaxHighligher>
      <h4>If Statements</h4>
      <p>
        If statements are actually just a regular function, like everything else in lasagna.
        In Lasagna, like C, 0 is considered as false, and any other number is considered true.
      </p>
      <p>
        The ifelse function takes 3 parameters, first a u8 number and two strings to be evaluated.
        The first string will be evaluated if the number is not equal to zero, and the second string will be evaluated if it was zero.
      </p>
      <p>
        Let's take a look at an example:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        1

        ( # If
        (if the above condition is true, this will print) println
        )
        ( # Else
        (if not, this will) println
        )
        ifelse
      `}</SyntaxHighligher>
      <p>
        First, the top value in the stack, <code>1</code> here, is pushed to the stack.
        Then we push the true branch and the false branch to the stack.
        When the ifelse function runs, all three of these are popped off the stack.
        Since the condition is 1, the first branch is evaluated.
        This pushes the string <code>if the following condition is true, this will print</code> to the stack and then prints it.
      </p>
      <h4>Defining a Function</h4>
      <p>
        In order to define a new function, you'll have to use the <code>mkfun</code> function.
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        ((hello) println) (say-hello) mkfun
      `}</SyntaxHighligher>
      <p>
        Now, the word <code>say-hello</code> refers to a function name that we can use.
      </p>
      <p>
        The following example should print out <code>hello world</code>, if we run it after the above defintion:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        say-hello
      `}</SyntaxHighligher>
      <h4>Loops</h4>
      <p>
        To make a loop we use the <code>loop</code> function.
        Loops repeatedly evaluate the given string as long as the topmost value on the stack is not 0.
        They pop the value of the stack before executing the body.
      </p>
      <p>To print a word 10 times:</p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        10
        (
          (a word) println
          1 -u8
          dupu8
        ) loop
      `}</SyntaxHighligher>
      <p>
        Note that we use the <code>dupu8</code> function to duplicate the topmost value on the stack before the end of the loop.
      </p>
      <h4>Fizzbuzz</h4>
      <p>
        Here's how to write the classic Fizzbuzz program in Lasagna:
      </p>
      <SyntaxHighligher className="mx-5" showLineNumbers style={a11yDark}>{outdent`
        100
        1 ( # loop
          # Although the loop counts down, we must count up
          dupu8
          100 -u8

          dupu8 3 %u8 0 ==u8 dupu8 5 %u8 0 ==u8 &&u8 #if
          (
            (fizz buzz) println
          )
          # Else
          (
            dupu8 3 %u8 0 ==u8 #if
            (
              (fizz) println
            )
            # Else
            (
              dupu8 5 %u8 0 ==u8 #if
              (
                (buzz) println
              ) () ifelse
            ) ifelse
          ) ifelse

          dropu8 # Drop the 100 - version
          1 -u8  # Subtract 1 from counter
          dupu8  # Make copy for loop to consume
        ) loop
      `}</SyntaxHighligher>
    </Section>
    <Section id="conclusion" name="Conclusion">
      <p>
        While Lasagna is a pretty simple language, it's also incredibly slow, and pretty much useless for production purposes.
        Nonetheless, it was very fun and educational to make. Here is a list of the things I learned while making the project:
      </p>
      <ul>
        <li>
          <p>
            It's hard to make a language homoiconic as well as legible.
            Lasagna is not a particularly legible language.
            The Forth style <a href="https://en.wikipedia.org/wiki/Reverse_Polish_notation">RPN</a> syntax is not intuititve
            since most people are accustomed to reading equations with functions at the front.
            Lasagna also has the disadvantage that math operations aren't infixed.
          </p>
          <p>
            I think Lisp actually does a fairly good job with this (definitely better than Lasagna, since functions go at the front),
            but even it is not super friendly when it comes to math.
          </p>
        </li>
        <li>
          C is a very poor language for writing templated code.
          Take a look at this monstrosity:
          <SyntaxHighligher className="mx-5" showLineNumbers language="c" style={a11yDark}>{outdent`
            /* Function that takes in two args returns one */
            #define DEFINE_ARG2_RET1_NATIVE_FUN(type, identifier, operation1) \\
              static void identifier##_##type(Vector *stack, Table *funtab) { \\
                UNUSED(funtab);                                               \\
                type arg1, arg2, ret1;                                        \\
                popVector(stack, &arg1, sizeof(arg1));                        \\
                popVector(stack, &arg2, sizeof(arg2));                        \\
                ret1 = operation1;                                            \\
                *((type *)pushVector(stack, sizeof(ret1))) = ret1;            \\
              }

            #define DEFINE_TYPE(type)                                                \\
              /* Define Math Functions */                                            \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, add, arg2 + arg1)                    \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, sub, arg2 - arg1)                    \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, mul, arg2 *arg1)                     \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, div, arg2 / arg1)                    \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, mod, arg2 % arg1)                    \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, or, arg2 || arg1)                    \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, and, arg2 &&arg1)                    \\
              DEFINE_ARG2_RET1_NATIVE_FUN(type, equ, arg2 == arg1)                   \\
              /* Define dup, drop, and swp */                                        \\
              static void dup_##type(Vector *stack, Table *funtab) {                 \\
                UNUSED(funtab);                                                      \\
                type arg1, ret1, ret2;                                               \\
                popVector(stack, &arg1, sizeof(arg1));                               \\
                ret1 = arg1;                                                         \\
                ret2 = arg1;                                                         \\
                *((type *)pushVector(stack, sizeof(ret1))) = ret1;                   \\
                *((type *)pushVector(stack, sizeof(ret2))) = ret2;                   \\
              }                                                                      \\
              static void drop_##type(Vector *stack, Table *funtab) {                \\
                UNUSED(funtab);                                                      \\
                type arg1;                                                           \\
                popVector(stack, &arg1, sizeof(arg1));                               \\
              }                                                                      \\
              static void swp_##type(Vector *stack, Table *funtab) {                 \\
                UNUSED(funtab);                                                      \\
                type arg1, arg2, ret1, ret2;                                         \\
                popVector(stack, &arg1, sizeof(arg1));                               \\
                popVector(stack, &arg2, sizeof(arg2));                               \\
                ret1 = arg1;                                                         \\
                ret2 = arg2;                                                         \\
                *((type *)pushVector(stack, sizeof(ret1))) = ret1;                   \\
                *((type *)pushVector(stack, sizeof(ret2))) = ret2;                   \\
              }

            #define NATIVE_FUNCTION_PUT(funName, stringLiteral)                     \\
              do {                                                                  \\
                char *string = stringLiteral;                                       \\
                Function f;                                                         \\
                initNativeFunction(&f, &(funName));                                 \\
                putTable(funtab, string, strlen(string) + 1, &f, sizeof(Function)); \\
              } while (0)

            #define PUT_TYPE(type, name)                        \\
              do {                                              \\
                NATIVE_FUNCTION_PUT(add_##type, "+" #name);     \\
                NATIVE_FUNCTION_PUT(sub_##type, "-" #name);     \\
                NATIVE_FUNCTION_PUT(mul_##type, "*" #name);     \\
                NATIVE_FUNCTION_PUT(div_##type, "/" #name);     \\
                NATIVE_FUNCTION_PUT(mod_##type, "%" #name);     \\
                NATIVE_FUNCTION_PUT(or_##type, "||" #name);     \\
                NATIVE_FUNCTION_PUT(and_##type, "&&" #name);    \\
                NATIVE_FUNCTION_PUT(equ_##type, "==" #name);    \\
                NATIVE_FUNCTION_PUT(dup_##type, "dup" #name);   \\
                NATIVE_FUNCTION_PUT(drop_##type, "drop" #name); \\
                NATIVE_FUNCTION_PUT(swp_##type, "swp" #name);   \\
              } while (0)

            DEFINE_TYPE(uint8_t)
            DEFINE_TYPE(uint64_t)

            void initPrelude(Table *funtab) {
              PUT_TYPE(uint8_t, u8);
              PUT_TYPE(uint64_t, u64);

              NATIVE_FUNCTION_PUT(mkfun, "mkfun");
              NATIVE_FUNCTION_PUT(delfun, "delfun");
              NATIVE_FUNCTION_PUT(eval, "eval");
              NATIVE_FUNCTION_PUT(ifelse, "ifelse");
              NATIVE_FUNCTION_PUT(loop, "loop");
              NATIVE_FUNCTION_PUT(print, "print");
              NATIVE_FUNCTION_PUT(println, "println");
              NATIVE_FUNCTION_PUT(dump, "dump");
            }
         `}</SyntaxHighligher>
          C has a lot of other annoying problems as well, like pointer decay, it's pointer syntax, and the way macros work.
        </li>
      </ul>
      <h4>Next Steps</h4>
      <p>
        I think I'm pretty much finished with Lasagna, and I don't intend on developing it further.
        However, if you find any bugs or have some suggestions, let me know.
      </p>
      <p>
        Regarding programming language design, my attention has shifted to <ArticleLink a={articleData.get("achernar")!} />.
      </p>
    </Section>
  </>
}</ArticleLayout>

import { createRoot } from 'react-dom/client';

// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <LasagnaPage />
  </React.StrictMode>,
);
