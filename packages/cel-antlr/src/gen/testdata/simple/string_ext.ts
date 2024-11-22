import type {JsonValue} from "@bufbuild/protobuf";

export const JSON: JsonValue = {
  section: [
    {
      name: "charAt",
      test: [
        { expr: "'tacocat'.charAt(3)", value: { string_value: "o" } },
        { expr: "'tacocat'.charAt(7)", value: { string_value: "" } },
        {
          expr: "'©αT'.charAt(0) == '©' && '©αT'.charAt(1) == 'α' && '©αT'.charAt(2) == 'T'",
        },
      ],
    },
    {
      name: "indexOf",
      test: [
        { expr: "'tacocat'.indexOf('')", value: { int64_value: "0" } },
        { expr: "'tacocat'.indexOf('ac')", value: { int64_value: "1" } },
        { expr: "'tacocat'.indexOf('none') == -1" },
        { expr: "'tacocat'.indexOf('', 3) == 3" },
        { expr: "'tacocat'.indexOf('a', 3) == 5" },
        { expr: "'tacocat'.indexOf('at', 3) == 5" },
        { expr: "'ta©o©αT'.indexOf('©') == 2" },
        { expr: "'ta©o©αT'.indexOf('©', 3) == 4" },
        { expr: "'ta©o©αT'.indexOf('©αT', 3) == 4" },
        { expr: "'ta©o©αT'.indexOf('©α', 5) == -1" },
        { expr: "'ijk'.indexOf('k') == 2" },
        { expr: "'hello wello'.indexOf('hello wello') == 0" },
        { expr: "'hello wello'.indexOf('ello', 6) == 7" },
        { expr: "'hello wello'.indexOf('elbo room!!') == -1" },
        { expr: "'hello wello'.indexOf('elbo room!!!') == -1" },
      ],
    },
    {
      name: "lastIndexOf",
      test: [
        { expr: "'tacocat'.lastIndexOf('') == 7" },
        { expr: "'tacocat'.lastIndexOf('at') == 5" },
        { expr: "'tacocat'.lastIndexOf('none') == -1" },
        { expr: "'tacocat'.lastIndexOf('', 3) == 3" },
        { expr: "'tacocat'.lastIndexOf('a', 3) == 1" },
        { expr: "'ta©o©αT'.lastIndexOf('©') == 4" },
        { expr: "'ta©o©αT'.lastIndexOf('©', 3) == 2" },
        { expr: "'ta©o©αT'.lastIndexOf('©α', 4) == 4" },
        { expr: "'hello wello'.lastIndexOf('ello', 6) == 1" },
        { expr: "'hello wello'.lastIndexOf('low') == -1" },
        { expr: "'hello wello'.lastIndexOf('elbo room!!') == -1" },
        { expr: "'hello wello'.lastIndexOf('elbo room!!!') == -1" },
        { expr: "'hello wello'.lastIndexOf('hello wello') == 0" },
        { expr: "'bananananana'.lastIndexOf('nana', 7) == 6" },
      ],
    },
    {
      test: [
        { expr: "'TacoCat'.lowerAscii() == 'tacocat'" },
        { expr: "'TacoCÆt'.lowerAscii() == 'tacocÆt'" },
        { expr: "'TacoCÆt Xii'.lowerAscii() == 'tacocÆt xii'" },
        { expr: "'tacoCat'.upperAscii() == 'TACOCAT'" },
        { expr: "'tacoCαt'.upperAscii() == 'TACOCαT'" },
      ],
      name: "Ascii casing",
    },
    {
      name: "replace",
      test: [
        {
          expr: "'12 days 12 hours'.replace('{0}', '2') == '12 days 12 hours'",
        },
        {
          expr: "'{0} days {0} hours'.replace('{0}', '2') == '2 days 2 hours'",
        },
        {
          expr: "'{0} days {0} hours'.replace('{0}', '2', 1).replace('{0}', '23') == '2 days 23 hours'",
        },
        { expr: "'1 ©αT taco'.replace('αT', 'o©α') == '1 ©o©α taco'" },
      ],
    },
    {
      name: "split",
      test: [
        { expr: "'hello world'.split(' ') == ['hello', 'world']" },
        { expr: "'hello world events!'.split(' ', 0) == []" },
        {
          expr: "'hello world events!'.split(' ', 1) == ['hello world events!']",
        },
        { expr: "'o©o©o©o'.split('©', -1) == ['o', 'o', 'o', 'o']" },
      ],
    },
    {
      name: "substring",
      test: [
        { expr: "'tacocat'.substring(4) == 'cat'" },
        { expr: "'tacocat'.substring(7) == ''" },
        { expr: "'tacocat'.substring(0, 4) == 'taco'" },
        { expr: "'tacocat'.substring(4, 4) == ''" },
        { expr: "'ta©o©αT'.substring(2, 6) == '©o©α'" },
        { expr: "'ta©o©αT'.substring(7, 7) == ''" },
      ],
    },
    {
      name: "trim",
      test: [
        { expr: "' \\f\\n\\r\\t\\vtext  '.trim() == 'text'" },
        { expr: "'\\u0085\\u00a0\\u1680text'.trim() == 'text'" },
        {
          expr: "'text\\u2000\\u2001\\u2002\\u2003\\u2004\\u2004\\u2006\\u2007\\u2008\\u2009'.trim() == 'text'",
        },
        {
          expr: "'\\u200atext\\u2028\\u2029\\u202F\\u205F\\u3000'.trim() == 'text'",
        },
        {
          expr: "'\\u180etext\\u200b\\u200c\\u200d\\u2060\\ufeff'.trim() == '\\u180etext\\u200b\\u200c\\u200d\\u2060\\ufeff'",
        },
      ],
    },
    {
      name: "join",
      test: [
        { expr: "['x', 'y'].join() == 'xy'" },
        { expr: "['x', 'y'].join('-') == 'x-y'" },
        { expr: "[].join() == ''" },
        { expr: "[].join('-') == ''" },
      ],
    },
    {
      name: "quote",
      test: [
        {
          expr: 'strings.quote("first\\nsecond") == "\\"first\\\\nsecond\\""',
        },
        { expr: 'strings.quote("bell\\a") == "\\"bell\\\\a\\""' },
        { expr: 'strings.quote("\\bbackspace") == "\\"\\\\bbackspace\\""' },
        { expr: 'strings.quote("\\fform feed") == "\\"\\\\fform feed\\""' },
        {
          expr: 'strings.quote("carriage \\r return") == "\\"carriage \\\\r return\\""',
        },
        {
          expr: 'strings.quote("horizontal tab\\t") == "\\"horizontal tab\\\\t\\""',
        },
        {
          expr: 'strings.quote("vertical \\v tab") == "\\"vertical \\\\v tab\\""',
        },
        {
          expr: 'strings.quote("double \\\\\\\\ slash") == "\\"double \\\\\\\\\\\\\\\\ slash\\""',
        },
        {
          expr: 'strings.quote("two escape sequences \\\\a\\\\n") == "\\"two escape sequences \\\\\\\\a\\\\\\\\n\\""',
        },
        { expr: 'strings.quote("verbatim") == "\\"verbatim\\""' },
        {
          expr: 'strings.quote("ends with \\\\") == "\\"ends with \\\\\\\\\\""',
        },
        {
          expr: 'strings.quote("\\\\ starts with") == "\\"\\\\\\\\ starts with\\""',
        },
        {
          expr: 'strings.quote("printable unicode😀") == "\\"printable unicode😀\\""',
        },
        {
          expr: 'strings.quote("mid string \\" quote") == "\\"mid string \\\\\\" quote\\""',
        },
        {
          expr: 'strings.quote(\'single-quote with "double quote"\') == "\\"single-quote with \\\\\\"double quote\\\\\\"\\""',
        },
        { expr: 'strings.quote("size(\'ÿ\')") == "\\"size(\'ÿ\')\\""' },
        {
          expr: 'strings.quote("size(\'πέντε\')") == "\\"size(\'πέντε\')\\""',
        },
        { expr: 'strings.quote("завтра") == "\\"завтра\\""' },
        {
          expr: 'strings.quote("\\U0001F431\\U0001F600\\U0001F61B")',
          value: { string_value: '"🐱😀😛"' },
        },
        { expr: 'strings.quote("ta©o©αT") == "\\"ta©o©αT\\""' },
        { expr: 'strings.quote("")', value: { string_value: '""' } },
      ],
    },
    {
      name: "value errors",
      test: [
        {
          expr: "'tacocat'.charAt(30) == ''",
          eval_error: { errors: [{ message: "index out of range: 30" }] },
        },
        {
          expr: "'tacocat'.indexOf('a', 30) == -1",
          eval_error: { errors: [{ message: "index out of range: 30" }] },
        },
        {
          expr: "'tacocat'.lastIndexOf('a', -1) == -1",
          eval_error: { errors: [{ message: "index out of range: -1" }] },
        },
        {
          eval_error: { errors: [{ message: "index out of range: 30" }] },
          expr: "'tacocat'.lastIndexOf('a', 30) == -1",
        },
        {
          expr: "'tacocat'.substring(40) == 'cat'",
          eval_error: { errors: [{ message: "index out of range: 40" }] },
        },
        {
          expr: "'tacocat'.substring(-1) == 'cat'",
          eval_error: { errors: [{ message: "index out of range: -1" }] },
        },
        {
          expr: "'tacocat'.substring(1, 50) == 'cat'",
          eval_error: { errors: [{ message: "index out of range: 50" }] },
        },
        {
          eval_error: { errors: [{ message: "index out of range: 49" }] },
          expr: "'tacocat'.substring(49, 50) == 'cat'",
        },
        {
          expr: "'tacocat'.substring(4, 3) == ''",
          eval_error: {
            errors: [{ message: "invalid substring range. start: 4, end: 3" }],
          },
        },
      ],
    },
    {
      name: "type errors",
      test: [
        {
          expr: "42.charAt(2) == ''",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "'hello'.charAt(true) == ''",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
          expr: "24.indexOf('2') == 0",
        },
        {
          expr: "'hello'.indexOf(true) == 1",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          disable_check: true,
          expr: "42.indexOf('4', 0) == 0",
          eval_error: { errors: [{ message: "no such overload" }] },
        },
        {
          expr: "'42'.indexOf(4, 0) == 0",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "'42'.indexOf('4', '0') == 0",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
          expr: "'42'.indexOf('4', 0, 1) == 0",
        },
        {
          expr: "42.split('2') == ['4']",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "42.replace(2, 1) == '41'",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          disable_check: true,
          expr: "'42'.replace(2, 1) == '41'",
          eval_error: { errors: [{ message: "no such overload" }] },
        },
        {
          expr: "'42'.replace('2', 1) == '41'",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
          expr: "42.replace('2', '1', 1) == '41'",
        },
        {
          expr: "'42'.replace(2, '1', 1) == '41'",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          disable_check: true,
          expr: "'42'.replace('2', 1, 1) == '41'",
          eval_error: { errors: [{ message: "no such overload" }] },
        },
        {
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
          expr: "'42'.replace('2', '1', '1') == '41'",
        },
        {
          expr: "'42'.replace('2', '1', 1, false) == '41'",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "42.split('') == ['4', '2']",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
          expr: "'42'.split(2) == ['4']",
        },
        {
          expr: "42.split('2', '1') == ['4']",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "'42'.split(2, 1) == ['4']",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "'42'.split('2', '1') == ['4']",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
          expr: "'42'.split('2', 1, 1) == ['4']",
        },
        {
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
          expr: "'hello'.substring(1, 2, 3) == ''",
        },
        {
          expr: "30.substring(true, 3) == ''",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "'tacocat'.substring(true, 3) == ''",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
        {
          expr: "'tacocat'.substring(0, false) == ''",
          eval_error: { errors: [{ message: "no such overload" }] },
          disable_check: true,
        },
      ],
    },
  ],
  name: "strings v0",
  description: "Tests for the v0 strings extension library.",
};
