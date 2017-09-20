var VARIABLE_MATCHER = /(\B\${1,2}[\w\[\]*\d.]+)/g;
var AGGREGATE_FUNC_MATCHER = /(sum|sub|mul|div)\((.*?)\)/g;
var ARITHMETIC_OP_MATCHER2 = /{([^}^%^\/^\-^+^*]+)}/g;
var ARITHMETIC_OP_MATCHER = /[*\/%\-+]/g;
var TOKEN_MATCHER = /{([^{}]*)}/g;
var REF_MATCHER = /\B\$\$?[.\[\]*\d\w]+/g;
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
            else if (o && k in o) {
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
function isObject(elem) {
    return typeof elem === 'object';
}
function resetRegex(regex) {
    regex.lastIndex = 0;
}
function canResolveVariables(template, rootModel, parentModel) {
    var match, canResolve = true;
    if (match = VARIABLE_MATCHER.exec(template)) {
        do {
            var str = match[0];
            var toReplace = undefined;
            if (str.startsWith('$$')) {
                toReplace = utils.resolveVariable(rootModel, str.replace('$$', ''));
            }
            else if (str.startsWith('$')) {
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
        var res = b, temp = res, match;
        // replace variables if any
        if (match = VARIABLE_MATCHER.exec(res)) {
            do {
                var str = match[0];
                var toReplace = resolveValue(str, rootModel, parentModel);
                if (['', undefined, null, NaN].includes(toReplace)) {
                    toReplace = '';
                }
                if (isObject(toReplace)) {
                    temp = temp.replace(str, JSON.stringify(toReplace));
                }
                else {
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
        var match = void 0, temp = template;
        // eval aggregate functions
        if (match = AGGREGATE_FUNC_MATCHER.exec(temp)) {
            do {
                var func = match[1];
                var params = match[2];
                try {
                    params = JSON.parse(params);
                }
                catch (err) {
                    params = params.split(',').map(function (i) { return i.trim(); });
                }
                temp = temp.replace(match[0], utils[func].apply(utils, params));
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
    var hasMath = false, match;
    while (match = TOKEN_MATCHER.exec(template)) {
        if (ARITHMETIC_OP_MATCHER.test(match[0]) || AGGREGATE_FUNC_MATCHER.test(match[0])) {
            hasMath = true;
        }
    }
    return hasMath;
}
export function getProperties(template) {
    resetRegex(REF_MATCHER);
    var props = [];
    var match;
    while (match = REF_MATCHER.exec(template)) {
        props.push(match[0]);
    }
    return props;
}
export function resolveValue(path, rootModel, parentModel) {
    if (path.startsWith('$$')) {
        return utils.resolveVariable(rootModel, path.replace('$$', ''));
    }
    else if (path.startsWith('$')) {
        return utils.resolveVariable(parentModel, path.replace('$', ''));
    }
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
        }
        else {
            return solveMathFunctions(replaceVariables(template, rootModel, parentModel));
        }
    }
    else {
        // there are no math functions, template has text result
        var result = replaceVariables(template, rootModel, parentModel).trim();
        try {
            return JSON.parse(result);
        }
        catch (err) {
            return result;
        }
    }
}
