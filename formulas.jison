/* description: Parses end executes mathematical expressions. */

%{
  var funcs = {
    pow: function(a,b) {
        if (arguments.length > 2) { throw new SyntaxError("pow takes 2 arguments"); }
        return Math.pow(a,b); 
    },
    test: function(a) { return a*2; }
  }
%}

/* lexical grammar */
%lex

%%

\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
[a-zA-Z]+             return 'NAME'
","                   return ','
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"("                   return '('
")"                   return ')'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left UMINUS

%start expressions

%% /* language grammar */
expressions
    : e EOF
      { console.log($1); return $1; }
    ;

expression_list
    : expression_list ',' e
      { $$ = $1.concat([$3]); }
    | e
      { $$ = [$1]; }
    ;

e
    : e '+' e
        {$$ = $1+$3;}
    | e '-' e
        {$$ = $1-$3;}
    | e '*' e
        {$$ = $1*$3;}
    | e '/' e
        {$$ = $1/$3;}
    | '-' e %prec UMINUS
        {$$ = -$2;}
    | '(' e ')'
        {$$ = $2;}
    | NUMBER
        {$$ = Number(yytext);}
    | NAME '(' expression_list ')'
        {$$ = funcs[$1].apply(undefined, $3);}
    ;