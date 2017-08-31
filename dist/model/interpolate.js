var IS_DEV = process.env.NODE_ENV === 'development';
var VARIABLE_MATCHER = /(\B\${1,2}[\w\[\]*\d.]+)/g;
var AGGREGATE_FUNC_MATCHER = /(sum|sub|mul|div)\((.*?)\)/g;
var ARITHMETIC_OP_MATCHER = /[()%+\-\/]|\*(?![^[]*])/g;
var utils = {
    resolveVariable: function resolveVariable(o, s) {
        s = s.replace(/\[(\*|\w+)]/g, '.$1');
        s = s.replace(/^\./, '');
        var a = s.split('.');
        var _loop_1 = function (i, n) {
            var k = a[i];
            if (k === '*' && Array.isArray(o)) {
                return { value: o.map(function (item) { return item[a[i + 1]]; }) };
            }
            else if (k in o) {
                o = o[k];
            }
            else {
                return { value: void 0 };
            }
        };
        for (var i = 0, n = a.length; i < n; ++i) {
            var state_1 = _loop_1(i, n);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return o;
    },
    sum: function sum() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.reduce(function (a, b) {
            if (Array.isArray(b)) {
                return a + sum.apply(void 0, b);
            }
            else {
                return a + parseFloat(b);
            }
        }, 0);
    },
    mul: function mul() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.reduce(function (a, b) {
            if (Array.isArray(b)) {
                return a * mul.apply(void 0, b);
            }
            else {
                return a * parseFloat(b);
            }
        }, 1);
    },
    sub: function sub() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.reduce(function (a, b) {
            if (Array.isArray(b)) {
                return a - sub.apply(void 0, b);
            }
            else {
                return a - parseFloat(b);
            }
        });
    },
    div: function div() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.reduce(function (a, b) {
            if (Array.isArray(b)) {
                return a / div.apply(void 0, b);
            }
            else {
                return a / parseFloat(b);
            }
        });
    }
};
export function interpolate(template, rootModel, parentModel) {
    return template.replace(/{([^{}]*)}/g, function (a, b) {
        if (!rootModel || !parentModel) {
            return;
        }
        var result = b, temp = result, match;
        // replace variables if any
        if (match = VARIABLE_MATCHER.exec(result)) {
            var resolved_1 = [];
            do {
                var str = match[0];
                if (str.startsWith('$$')) {
                    resolved_1.push(utils.resolveVariable(rootModel, str.replace('$$', '')));
                    temp = temp.replace(str, utils.resolveVariable(rootModel, str.replace('$$', '')));
                }
                else if (str.startsWith('$')) {
                    resolved_1.push(utils.resolveVariable(parentModel, str.replace('$', '')));
                    temp = temp.replace(str, utils.resolveVariable(parentModel, str.replace('$', '')));
                }
            } while (match = VARIABLE_MATCHER.exec(result));
            if (['', undefined, null, NaN].every(function (f) { return !resolved_1.includes(f); })) {
                result = temp;
            }
            else {
                if (IS_DEV) {
                    console.warn("Not all variables could resolved in template: " + template);
                }
                return;
            }
        }
        // eval aggregate functions
        if (match = AGGREGATE_FUNC_MATCHER.exec(result)) {
            temp = result;
            do {
                var func = match[1];
                var params = match[2].split(',').map(function (i) { return i.trim(); });
                temp = temp.replace(match[0], utils[func].apply(utils, params));
            } while (match = AGGREGATE_FUNC_MATCHER.exec(result));
            result = temp;
        }
        // execute arithmetic operators if any
        if (ARITHMETIC_OP_MATCHER.test(result)) {
            result = eval(result);
        }
        return result;
    });
}