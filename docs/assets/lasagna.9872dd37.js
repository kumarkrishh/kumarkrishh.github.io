import"./modulepreload-polyfill.c7c6310f.js";import{j as e,a as s,b as t,F as o}from"./bootstrap.0afc7782.js";import{S as r}from"./Section.59c5635d.js";import{H as l}from"./HrefLink.bea77805.js";import{A as h}from"./ArticleLayout.9ae09534.js";import{L as c}from"./lasagna.05db1353.js";import{d as a}from"./index.af98421e.js";import{a as d,b as p}from"./Articles.82ce124d.js";import{c as u}from"./client.8e44f6e0.js";import{S as n,a as i}from"./a11y-dark.07c9877b.js";const m=()=>e(h,{children:({Citation:f,CitationBank:N})=>t(o,{children:[t(r,{id:"lasagna",name:"Lasagna",children:[e("p",{children:"Very small stack based programming language."}),e("img",{src:c,className:"border border-dark d-block mx-auto mb-5",style:{width:"30rem"},alt:"Lasagna Logo"}),e("h4",{children:"Motivation"}),e("p",{children:"I created Lasagna mostly for fun, but also to try my hand at writing a very simple intepreter in C. The entire source code (at time of writing) is only 824 lines of C, and could easily be compressed further while maintaining readability."}),t("p",{children:["The language is very similar to ",e("a",{href:"https://en.wikipedia.org/wiki/Forth_(programming_language)",children:"Forth"}),", which similarly uses a stack to store arguments for functions."]}),t("p",{children:["It shares with ",e("a",{href:"https://en.wikipedia.org/wiki/Lisp_(programming_language)",children:"Lisp"})," the property of ",e("a",{href:"https://en.wikipedia.org/wiki/Homoiconicity",children:"homoiconicity"}),". This means that a program written in Lasagna treats its own code as data. Lisp accomplishes this using lists, which means any Lisp code can be represented as a list. Lasagna uses strings for this purpose."]}),e("p",{children:"Lasagna syntax uses code stored in strings heavily, for loops, if statements, and other control structures. The string syntax is somewhat inspired by Lisp, since we use parentheses instead of double quotes."}),e("h4",{children:"Name/Logo Explanation"}),e("p",{children:"It's named Lasagna due to its stack based nature. Just as a lasagna has many delicious pasta layers, the executing program will also have layers of tasty strings and numbers."}),e("p",{children:"The logo is remniscent of a famous cartoon cat who is notoriously fond of lasagna."})]}),t(r,{id:"usage",name:"How to Use",children:[e("h4",{children:"Building the Interpreter"}),t("p",{children:["The source code is located here: ",e(l,{href:"https://github.com/pimpale/lasagna"})]}),t("p",{children:["First, ensure that you have ",e("a",{href:"https://en.wikipedia.org/wiki/Clang",children:"Clang"})," installed, as well as ",e("a",{href:"https://en.wikipedia.org/wiki/Make_(software)",children:"make"})," and ",e("a",{href:"https://en.wikipedia.org/wiki/Find_(Unix)",children:"find"}),"."]}),e("p",{children:"Then, clone the repository, and from within the top level folder run:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:"make"}),e("h4",{children:"Running the Interpreter"}),t("p",{children:["After compilation, the interpreter binary will be located at ",e("code",{children:"obj/lasagna"}),"."]}),e("p",{children:"To get an interactive shell, run:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:"./obj/lasagna"}),e("p",{children:"To execute a Lasagna script, do:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:"./obj/lasagna <FILENAME>"})]}),t(r,{id:"guide",name:"Language Guide",children:[e("p",{children:"This language is based entirely on the stack and string. Some examples:"}),e("h4",{children:"hello world"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:"(hello world) print"}),t("p",{children:["This prints hello world. Instead of the ",e("code",{children:'"'})," character, ",e("code",{children:"("})," and ",e("code",{children:")"})," are used to represent strings, and can be nested. The string is pushed onto the stack character by character, with a leading and terminating null byte.",e("code",{children:"printstr"})," is one of a few built in functions defined in src/functions.c"]}),e("h4",{children:"Comments"}),t("p",{children:["Comments go from a ",e("code",{children:"#"})," to the end of the line, and can be defined anywhere (even in a string). To include a literal ",e("code",{children:"#"})," in the string, use a backslash."]}),e("p",{className:"mb-4",children:"Some examples of usage:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        (hello
        # This is a comment
        world) println
      `}),e("p",{children:"This code would print out:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        hello
        world
      `}),e("p",{children:"However, if we escape the hash, it would be:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        (hello
        \# This is a comment
        world) println
      `}),e("p",{children:"This results in"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        hello
        # This is a comment
        world
      `}),e("h4",{children:"Math"}),e("p",{children:"For the most part, math is pretty self explanatory. Due to technical limitations, all numbers right now are unsigned 8 bit integers. Therefore, numeric literals must be positive integers less than 255."}),e("p",{children:"Example:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        1 2 +u8 print8
      `}),e("p",{children:"Execution of the program is left to right. So, this program pushes the bytes 1 and 2, sums them, and prints the result."}),e("h4",{children:"Eval"}),t("p",{children:["A very important function in Lasagna is ",e("code",{children:"eval"}),", since it's used as a building block for many other control statements. This function takes in a string stored on the stack, and evaluates it as Lasagna source code."]}),e("p",{children:"Let's look at a somewhat contrived example:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        ((one level deep) print) eval
      `}),t("p",{children:["Since parentheses can be nested, it's not a problem that we have strings inside other strings. What happens is that when the branch is evaluated, the inner string will be pushed onto the stack. In this example, we first see the string ",e("code",{children:"((one level deep) print)"})," and push it onto the stack. We then reach the ",e("code",{children:"eval"})," function, which pops the string off the stack and begins executing it as code. This causes ",e("code",{children:"one level deep"})," to be pushed to the stack. We then execute the ",e("code",{children:"print"})," function, which pops the string and prints it out."]}),e("p",{children:"So, this fragment will output:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        one level deep
      `}),e("h4",{children:"If Statements"}),e("p",{children:"If statements are actually just a regular function, like everything else in lasagna. In Lasagna, like C, 0 is considered as false, and any other number is considered true."}),e("p",{children:"The ifelse function takes 3 parameters, first a u8 number and two strings to be evaluated. The first string will be evaluated if the number is not equal to zero, and the second string will be evaluated if it was zero."}),e("p",{children:"Let's take a look at an example:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        1

        ( # If
        (if the above condition is true, this will print) println
        )
        ( # Else
        (if not, this will) println
        )
        ifelse
      `}),t("p",{children:["First, the top value in the stack, ",e("code",{children:"1"})," here, is pushed to the stack. Then we push the true branch and the false branch to the stack. When the ifelse function runs, all three of these are popped off the stack. Since the condition is 1, the first branch is evaluated. This pushes the string ",e("code",{children:"if the following condition is true, this will print"})," to the stack and then prints it."]}),e("h4",{children:"Defining a Function"}),t("p",{children:["In order to define a new function, you'll have to use the ",e("code",{children:"mkfun"})," function."]}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        ((hello) println) (say-hello) mkfun
      `}),t("p",{children:["Now, the word ",e("code",{children:"say-hello"})," refers to a function name that we can use."]}),t("p",{children:["The following example should print out ",e("code",{children:"hello world"}),", if we run it after the above defintion:"]}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        say-hello
      `}),e("h4",{children:"Loops"}),t("p",{children:["To make a loop we use the ",e("code",{children:"loop"})," function. Loops repeatedly evaluate the given string as long as the topmost value on the stack is not 0. They pop the value of the stack before executing the body."]}),e("p",{children:"To print a word 10 times:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
        10
        (
          (a word) println
          1 -u8
          dupu8
        ) loop
      `}),t("p",{children:["Note that we use the ",e("code",{children:"dupu8"})," function to duplicate the topmost value on the stack before the end of the loop."]}),e("h4",{children:"Fizzbuzz"}),e("p",{children:"Here's how to write the classic Fizzbuzz program in Lasagna:"}),e(n,{className:"mx-5",showLineNumbers:!0,style:i,children:a`
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
      `})]}),t(r,{id:"conclusion",name:"Conclusion",children:[e("p",{children:"While Lasagna is a pretty simple language, it's also incredibly slow, and pretty much useless for production purposes. Nonetheless, it was very fun and educational to make. Here is a list of the things I learned while making the project:"}),t("ul",{children:[t("li",{children:[t("p",{children:["It's hard to make a language homoiconic as well as legible. Lasagna is not a particularly legible language. The Forth style ",e("a",{href:"https://en.wikipedia.org/wiki/Reverse_Polish_notation",children:"RPN"})," syntax is not intuititve since most people are accustomed to reading equations with functions at the front. Lasagna also has the disadvantage that math operations aren't infixed."]}),e("p",{children:"I think Lisp actually does a fairly good job with this (definitely better than Lasagna, since functions go at the front), but even it is not super friendly when it comes to math."})]}),t("li",{children:["C is a very poor language for writing templated code. Take a look at this monstrosity:",e(n,{className:"mx-5",showLineNumbers:!0,language:"c",style:i,children:a`
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
         `}),"C has a lot of other annoying problems as well, like pointer decay, it's pointer syntax, and the way macros work."]})]}),e("h4",{children:"Next Steps"}),e("p",{children:"I think I'm pretty much finished with Lasagna, and I don't intend on developing it further. However, if you find any bugs or have some suggestions, let me know."}),t("p",{children:["Regarding programming language design, my attention has shifted to ",e(d,{a:p.get("achernar")}),"."]})]})]})}),g=u(document.getElementById("root"));g.render(e(s.StrictMode,{children:e(m,{})}));
