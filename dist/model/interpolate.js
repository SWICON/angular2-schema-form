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
function allResolved(resolved) {
    return ['', undefined, null, NaN].every(function (f) { return !resolved.includes(f); });
}
export function interpolate(template, rootModel, parentModel) {
    if (!rootModel || !parentModel) {
        return;
    }
    var result = template.replace(/{([^{}]*)}/g, function (a, b) {
        var res = b, temp = res, resolved = [], match;
        // replace variables if any
        if (match = VARIABLE_MATCHER.exec(res)) {
            do {
                var str = match[0];
                var toReplace = undefined;
                if (str.startsWith('$$')) {
                    resolved.push(utils.resolveVariable(rootModel, str.replace('$$', '')));
                    toReplace = utils.resolveVariable(rootModel, str.replace('$$', ''));
                }
                else if (str.startsWith('$')) {
                    resolved.push(utils.resolveVariable(parentModel, str.replace('$', '')));
                    toReplace = utils.resolveVariable(parentModel, str.replace('$', ''));
                }
                if (['', undefined, null, NaN].includes(toReplace)) {
                    toReplace = '';
                }
                temp = temp.replace(str, toReplace);
            } while (match = VARIABLE_MATCHER.exec(res));
            res = temp;
        }
        if (ARITHMETIC_OP_MATCHER.test(res) || AGGREGATE_FUNC_MATCHER.test(res)) {
            if (allResolved(resolved)) {
                // eval aggregate functions
                if (match = AGGREGATE_FUNC_MATCHER.exec(res)) {
                    temp = res;
                    do {
                        var func = match[1];
                        var params = match[2].split(',').map(function (i) { return i.trim(); });
                        temp = temp.replace(match[0], utils[func].apply(utils, params));
                    } while (match = AGGREGATE_FUNC_MATCHER.exec(res));
                    res = temp;
                }
                // execute arithmetic operators if any
                if (ARITHMETIC_OP_MATCHER.test(res)) {
                    res = eval(res);
                }
            }
            else {
                res = null;
            }
        }
        else {
            res = null;
        }
        return res;
    });
    return result;
}
