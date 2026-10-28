import type { Language } from '@/lessons/types';

export type TokenKind =
  | 'keyword'
  | 'type'
  | 'string'
  | 'number'
  | 'comment'
  | 'annotation'
  | 'method'
  | 'punctuation'
  | 'plain'
  | 'blank';

export type Token = { kind: TokenKind; text: string };

const KEYWORDS: Partial<Record<Language, string[]>> = {
  java: [
    'abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'continue', 'default',
    'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements',
    'import', 'instanceof', 'int', 'interface', 'long', 'new', 'null', 'package', 'private', 'protected',
    'public', 'record', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw',
    'throws', 'try', 'var', 'void', 'volatile', 'while', 'true', 'false', 'yield', 'sealed', 'permits',
  ],
  kotlin: [
    'class', 'data', 'else', 'false', 'for', 'fun', 'if', 'in', 'interface', 'is', 'null', 'object',
    'override', 'package', 'private', 'return', 'sealed', 'super', 'this', 'throw', 'true', 'try',
    'val', 'var', 'when', 'while', 'import', 'internal', 'open', 'suspend', 'companion',
  ],
  typescript: [
    'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'else', 'export', 'extends',
    'false', 'for', 'from', 'function', 'if', 'import', 'interface', 'let', 'new', 'null', 'return',
    'switch', 'this', 'throw', 'true', 'try', 'type', 'undefined', 'while', 'of', 'in', 'default',
  ],
  sql: [
    'select', 'from', 'where', 'and', 'or', 'insert', 'into', 'values', 'update', 'set', 'delete',
    'join', 'left', 'inner', 'on', 'group', 'by', 'order', 'limit', 'as', 'null', 'not', 'create', 'table',
  ],
};

/** Marcador del hueco en los ejercicios fill-blank. */
export const BLANK = '___';

const TOKEN_RE =
  /(___)|(\/\/.*$|#.*$)|(\/\*.*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(@[A-Za-z_]\w*)|(\b\d[\d_]*(?:\.\d+)?[LlFfDd]?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d])/gm;

/**
 * Tokenizador por regex. No es un parser: alcanza para que el código se lea
 * como en un editor. Los comentarios de bloque de varias líneas se arrastran
 * entre líneas con `inBlockComment`.
 */
export function tokenize(code: string, language: Language): Token[][] {
  const keywords = new Set(KEYWORDS[language] ?? []);
  const caseInsensitive = language === 'sql';
  const hashComments = language === 'yaml';
  let inBlockComment = false;

  return code.split('\n').map((line) => {
    const tokens: Token[] = [];
    let rest = line;

    if (inBlockComment) {
      const end = rest.indexOf('*/');
      if (end === -1) return [{ kind: 'comment', text: rest }];
      tokens.push({ kind: 'comment', text: rest.slice(0, end + 2) });
      rest = rest.slice(end + 2);
      inBlockComment = false;
    }

    const open = rest.indexOf('/*');
    let tail = '';
    if (open !== -1 && rest.indexOf('*/', open) === -1) {
      tail = rest.slice(open);
      rest = rest.slice(0, open);
      inBlockComment = true;
    }

    for (const m of rest.matchAll(TOKEN_RE)) {
      const [text, blank, lineComment, blockComment, str, annotation, num, word] = m;
      if (blank) tokens.push({ kind: 'blank', text });
      else if (lineComment) {
        const isComment = lineComment.startsWith('//') || hashComments;
        tokens.push({ kind: isComment ? 'comment' : 'punctuation', text });
      } else if (blockComment) tokens.push({ kind: 'comment', text });
      else if (str) tokens.push({ kind: 'string', text });
      else if (annotation) tokens.push({ kind: 'annotation', text });
      else if (num) tokens.push({ kind: 'number', text });
      else if (word) {
        const lookup = caseInsensitive ? word.toLowerCase() : word;
        const next = rest.slice((m.index ?? 0) + word.length).trimStart();
        if (keywords.has(lookup)) tokens.push({ kind: 'keyword', text });
        else if (/^[A-Z]/.test(word) && !/^[A-Z0-9_]+$/.test(word)) tokens.push({ kind: 'type', text });
        else if (next.startsWith('(')) tokens.push({ kind: 'method', text });
        else tokens.push({ kind: 'plain', text });
      } else tokens.push({ kind: m[8] ? 'plain' : 'punctuation', text });
    }

    if (tail) tokens.push({ kind: 'comment', text: tail });
    return tokens;
  });
}
