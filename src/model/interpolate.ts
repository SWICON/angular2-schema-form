const VARIABLE_MATCHER = /(\B\${1,2}[\w\[\]*\d.]+)/g;
const AGGREGATE_FUNC_MATCHER = /(sum|sub|mul|div)\((.*?)\)/g;
const ARITHMETIC_OP_MATCHER2 = /{([^}^%^\/^\-^+^*]+)}/g;
const ARITHMETIC_OP_MATCHER = /[*\/%\-+]/g;
const TOKEN_MATCHER = /{([^{}]*)}/g;

const utils = {
  resolveVariable: function resolveVariable(o, s) {
    s = s.replace(/\[(\*|\w+)]/g, '.$1');
    s = s.replace(/^\./, '');
    const a = s.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
      const k = a[i];
      if (k === '*' && Array.isArray(o)) {
        return o.map(item => item[a[i + 1]]);
      } else if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  },
  sum: function sum(...args) {
    return args.reduce((a, b) => {
      if (Array.isArray(b)) {
        return a + sum(...b);
      } else {
        return a + parseFloat(b);
      }
    }, 0);
  },
  mul: function mul(...args) {
    return args.reduce((a, b) => {
      if (Array.isArray(b)) {
        return a * mul(...b);
      } else {
        return a * parseFloat(b);
      }
    }, 1);
  },
  sub: function sub(...args) {
    return args.reduce((a, b) => {
      if (Array.isArray(b)) {
        return a - sub(...b);
      } else {
        return a - parseFloat(b);
      }
    });
  },
  div: function div(...args) {
    return args.reduce((a, b) => {
      if (Array.isArray(b)) {
        return a / div(...b);
      } else {
        return a / parseFloat(b);
      }
    });
  }
};

function isObject(elem) {
  return typeof elem === 'object';
}

function resetRegex(regex) {
  regex.lastIndex = 0;
}

function canResolveVariables(template, rootModel, parentModel) {
  let match, canResolve = true;
  if (match = VARIABLE_MATCHER.exec(template)) {
    do {
      const str = match[0];
      let toReplace = undefined;
      if (str.startsWith('$$')) {
        toReplace = utils.resolveVariable(rootModel, str.replace('$$', ''))
      } else if (str.startsWith('$')) {
        toReplace = utils.resolveVariable(parentModel, str.replace('$', ''));
      }

      if (toReplace === undefined) {
        canResolve = false;
      }
    } while (match = VARIABLE_MATCHER.exec(template));
  }

  return canResolve;
}

function replaceVariables(template, rootModel, parentModel) {
  resetRegex(VARIABLE_MATCHER);

  return template.replace(/{([^{}]*)}/g, function (a, b) {
    let res = b,
      temp = res,
      match;

    // replace variables if any
    if (match = VARIABLE_MATCHER.exec(res)) {
      do {
        const str = match[0];
        let toReplace = undefined;
        if (str.startsWith('$$')) {
          toReplace = utils.resolveVariable(rootModel, str.replace('$$', ''))
        } else if (str.startsWith('$')) {
          toReplace = utils.resolveVariable(parentModel, str.replace('$', ''));
        }
        if (['', undefined, null, NaN].includes(toReplace)) {
          toReplace = '';
        }
        if (isObject(toReplace)) {
          temp = temp.replace(str, JSON.stringify(toReplace));
        } else {
          temp = temp.replace(str, toReplace);
        }
        // temp = temp.replace(str, toReplace);
      } while (match = VARIABLE_MATCHER.exec(res));

      res = temp;
    }

    return res;
  });
}

function solveMathFunctions(template) {
  resetRegex(ARITHMETIC_OP_MATCHER);
  resetRegex(AGGREGATE_FUNC_MATCHER);

  if (AGGREGATE_FUNC_MATCHER.test(template)) {
    resetRegex(AGGREGATE_FUNC_MATCHER);
    let match, temp = template;
    // eval aggregate functions
    if (match = AGGREGATE_FUNC_MATCHER.exec(temp)) {
      do {
        const func = match[1];
        let params = match[2];
        try {
          params = JSON.parse(params);
        } catch (err) {
          params = params.split(',').map(i => i.trim());
        }
        temp = temp.replace(match[0], utils[func](...params));
      } while (match = AGGREGATE_FUNC_MATCHER.exec(temp));

      template = temp;
    }
  }

  if (ARITHMETIC_OP_MATCHER.test(template)) {
    template = eval(template);
  }

  return template;
}

function hasMathFunctions(template) {
  let hasMath = false,
    match;
  while (match = TOKEN_MATCHER.exec(template)) {
    if (ARITHMETIC_OP_MATCHER.test(match[0]) || AGGREGATE_FUNC_MATCHER.test(match[0])) {
      hasMath = true;
    }
  }
  return hasMath;
}
export function interpolate(template, rootModel, parentModel) {
  if (!rootModel || !parentModel) {
    return null;
  }

  // if template has arithmetic or aggregate function we return the
  // result only if all variable could resolved
  if (hasMathFunctions(template)) {
    resetRegex(ARITHMETIC_OP_MATCHER2);
    resetRegex(AGGREGATE_FUNC_MATCHER);

    if (!canResolveVariables(template, rootModel, parentModel)) {
      return null;
    } else {
      return solveMathFunctions(replaceVariables(template, rootModel, parentModel));
    }
  } else {
    // there are no math functions, template has text result
    let result = replaceVariables(template, rootModel, parentModel).trim();
    try {
      return JSON.parse(result);
    } catch (err) {
      return result;
    }
  }
}
