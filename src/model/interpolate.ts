const IS_DEV = process.env.NODE_ENV === 'development';
const VARIABLE_MATCHER = /(\B\${1,2}[\w\[\]*\d.]+)/g;
const AGGREGATE_FUNC_MATCHER = /(sum|sub|mul|div)\((.*?)\)/g;
const ARITHMETIC_OP_MATCHER = /[()%+\-\/]|\*(?![^[]*])/g;

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

export function interpolate(template, rootModel, parentModel) {
  try {
    return template.replace(/{([^{}]*)}/g, function (a, b) {
      if (!rootModel || !parentModel) {
        return;
      }

      let result = b,
        temp = result,
        match;

      // replace variables if any
      const resolved = [];
      if (match = VARIABLE_MATCHER.exec(result)) {
        do {
          const str = match[0];
          if (str.startsWith('$$')) {
            resolved.push(utils.resolveVariable(rootModel, str.replace('$$', '')));
            temp = temp.replace(str, utils.resolveVariable(rootModel, str.replace('$$', '')));
          } else if (str.startsWith('$')) {
            resolved.push(utils.resolveVariable(parentModel, str.replace('$', '')));
            temp = temp.replace(str, utils.resolveVariable(parentModel, str.replace('$', '')));
          }
        } while (match = VARIABLE_MATCHER.exec(result));

        if (['', undefined, null, NaN].every(f => !resolved.includes(f))) {
          result = temp;
        } else {
          throw `Not all variables could resolved in template: ${template}`;
        }
      }

      // eval aggregate functions
      if (match = AGGREGATE_FUNC_MATCHER.exec(result)) {
        temp = result;

        do {
          const func = match[1];
          const params = match[2].split(',').map(i => i.trim());
          temp = temp.replace(match[0], utils[func](...params));
        } while (match = AGGREGATE_FUNC_MATCHER.exec(result));

        result = temp;
      }

      // execute arithmetic operators if any
      if (ARITHMETIC_OP_MATCHER.test(result)) {
        result = eval(result);
      }

      return result;
    });
  } catch (err) {
    console.warn(err);
  }
}
