import {filter} from './tpl';
const isExisty = (value:any) => value !== null && value !== undefined
const isEmpty = (value:any) => value === '';
const makeRegexp = (reg:string|RegExp) => {
    if (reg instanceof RegExp) {
        return reg;
    } else if (/\/(.+)\/([gimuy]*)/.test(reg)) {
        return new RegExp(RegExp.$1, RegExp.$2 || '');
    } else if (typeof reg === 'string') {
        return new RegExp(reg);
    }

    return /^$/;
};

export interface ValidateFn {
    (values:{[propsName:string]: any}, value:any, arg1?:any, arg2?:any, arg3?:any): boolean;
};

export const validations:{
    [propsName:string]: ValidateFn
} = {
    isRequired: function (values, value:any) {
        return value !== undefined && value !== '' && value !== null && (!Array.isArray(value) || !!value.length);
    },
    isExisty: function (values, value) {
        return isExisty(value);
    },
    matchRegexp: function (values, value, regexp) {
        return !isExisty(value) || isEmpty(value) || makeRegexp(regexp).test(value);
    },
    isUndefined: function (values, value) {
        return value === undefined;
    },
    isEmptyString: function (values, value) {
        return isEmpty(value);
    },
    isEmail: function (values, value) {
        return validations.matchRegexp(values, value, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
    },
    isUrl: function (values, value) {
        return validations.matchRegexp(values, value, /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);
    },
    isTrue: function (values, value) {
        return value === true;
    },
    isFalse: function (values, value) {
        return value === false;
    },
    isNumeric: function (values, value) {
        if (typeof value === 'number') {
            return true;
        }
        return validations.matchRegexp(values, value, /^[-+]?(?:\d*[.])?\d+$/);
    },
    isAlpha: function (values, value) {
        return validations.matchRegexp(values, value, /^[A-Z]+$/i);
    },
    isAlphanumeric: function (values, value) {
        return validations.matchRegexp(values, value, /^[0-9A-Z]+$/i);
    },
    isInt: function (values, value) {
        return validations.matchRegexp(values, value, /^(?:[-+]?(?:0|[1-9]\d*))$/);
    },
    isFloat: function (values, value) {
        return validations.matchRegexp(values, value, /^(?:[-+]?(?:\d+))?(?:\.\d*)?(?:[eE][\+\-]?(?:\d+))?$/);
    },
    isWords: function (values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s]+$/i);
    },
    isSpecialWords: function (values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s\u00C0-\u017F]+$/i);
    },
    isLength: function (values, value, length) {
        return !isExisty(value) || isEmpty(value) || value.length === length;
    },
    equals: function (values, value, eql) {
        return !isExisty(value) || isEmpty(value) || value == eql;
    },
    equalsField: function (values, value, field) {
        return value == values[field];
    },
    maxLength: function (values, value, length) {
        return !isExisty(value) || value.length <= length;
    },
    minLength: function (values, value, length) {
        return !isExisty(value) || isEmpty(value) || value.length >= length;
    },
    isUrlPath: function(values, value, regexp) {
        return !isExisty(value) || isEmpty(value) || /^[a-z0-9_\\-]+$/i.test(value);
    },
    maximum: function(values, value, maximum) {
        return !isExisty(value) || isEmpty(value) || (parseFloat(value) || 0) <= (parseFloat(maximum) || 0);
    },
    minimum: function(values, value, minimum) {
        return !isExisty(value) || isEmpty(value) || (parseFloat(value) || 0) >= (parseFloat(minimum) || 0);
    },
    isJson: function(values, value, minimum) {
        if (isExisty(value) && !isEmpty(value)) {
            try {
                JSON.parse(value);
            } catch (e) {
                return false;
            }
        }
        return true;
    },
    notEmptyString: function(values, value) {
        return !isExisty(value) || !(String(value) && String(value).trim() === "");
    },
    matchRegexp1: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp2: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp3: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp4: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp5: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp6: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp7: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp8: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    },
    matchRegexp9: function(values, value, regexp) {
        return validations.matchRegexp(values, value, regexp);
    }
};

export function addRule(ruleName:string, fn: ValidateFn, message:string = '') {
    validations[ruleName] = fn;
    validateMessages[ruleName] = message;
}

export const validateMessages: {
    [propName:string]: string;
} = {
    isEmail: 'Email 格式不正确',
    isRequired: '这是必填项',
    isUrl: 'Url 格式不正确',
    isInt: '请输入整型数字',
    isAlpha: '请输入字母',
    isNumeric: '请输入数字',
    isAlphanumeric: '请输入字母或者数字',
    isFloat: '请输入浮点型数值',
    isWords: '请输入字母',
    isUrlPath: '只能输入字母、数字、`-` 和 `_`.',
    matchRegexp: '格式不正确, 请输入符合规则为 `$1` 的内容。',
    minLength: '请输入更多的内容，至少输入 $1 个字符。',
    maxLength: '请控制内容长度, 请不要输入 $1 个字符以上',
    maximum: '当前输入值超出最大值 $1，请检查',
    minimum: '当前输入值低于最小值 $1，请检查',
    isJson: '请检查 Json 格式。',
    isLength: '请输入长度为 $1 的内容',
    notEmptyString: '请不要全输入空白字符',
    equalsField: '输入的数据与 $1 值不一致',
    equals: '输入的数据与 $1 不一致'
}

export function validate(
    value:any,
    values:{[propName:string]: any},
    rules:{[propName:string]: any},
    messages?: {[propName:string]: string}
):Array<string> {
    const errors:Array<string> = [];

    Object.keys(rules).forEach(ruleName => {
        if (!rules[ruleName]) {
            return;
        } else if (typeof validations[ruleName] !== 'function') {
            throw new Error('Validation `' + ruleName + '` not exists!');
        }

        const fn = validations[ruleName];
        
        if (!fn(values, value, ...rules[ruleName])) {
            errors.push(filter(messages && messages[ruleName] || validateMessages[ruleName], {
                ...['', ...rules[ruleName]]
            }));
        }
    });

    return errors;
}

const splitValidations = function (str:string):Array<string> {
    let i = 0;
    const placeholder:{[propName: string]: string} = {};

    return str
    .replace(/matchRegexp\d*:\/.*?\/[igm]*/g, raw => {
        placeholder[`__${i}`] = raw;
        return `__${i++}`
    })
    .split(/,(?![^{\[]*[}\]])/g)
    .map(str => /^__\d+$/.test(str) ? placeholder[str] : str.trim())
};

export function str2rules(validations:string|{[propName:string]: any}):{[propName:string]: any} {
    if (typeof validations === 'string') {
        return validations ? splitValidations(validations).reduce(function (validations:{[propName:string]: any}, validation) {
            const idx = validation.indexOf(':');
            let validateMethod = validation;
            let args = [];

            if (~idx) {
                validateMethod = validation.substring(0, idx);
                args = validation.substring(idx + 1).split(',').map(function (arg) {
                    try {
                        return JSON.parse(arg);
                    } catch (e) {
                        return arg;
                    }
                });
            }

            validations[validateMethod] = args.length ? args : true;
            return validations;
        }, {}) : {};
    }

    return validations || {};
}
