var ISSchemaTools = (function () {
    'use strict';

    var root = {};
    var chainNs = {};
    var objFormatPattern = /\$\{(\w+)\}/g;
    var argsFormatPattern = /\$\{(\d+)\}/g;

    var _ = {
        _toString: Object.prototype.toString,

        _formatObj: function (str, data) {
            return str.replace(objFormatPattern, function (gr, capture) {
                return data[capture] || '';
            });
        },

        _formatArgs: function () {
            var str = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);

            return str.replace(argsFormatPattern, function (gr, capture) {
                return args[capture] || '';
            });
        },

        isNaN: function (val) {
            return val !== val;
        },

        isFunction: function (func) {
            return !!func && this._toString.call(func) === '[object Function]';
        },

        isObject: function (obj) {
            return obj !== null && typeof obj === 'object';
        },

        isNumber: function (n) {
            return this._toString.call(n) === '[object Number]' && !this.isNaN(n) && isFinite(n);
        },

        isBoolean: function (b) {
            return typeof b === 'boolean';
        },

        isEmpty: function (val, globalAllow, localAllow) {
            var isNull = val === null;

            if (isNull && _.isBoolean(localAllow)) {
                isNull = !localAllow;
            } else if (isNull && _.isBoolean(globalAllow)) {
                isNull = !globalAllow;
            }

            return isNull || val === undefined || val === "" || this.isNaN(val) || val === Infinity;
        },

        isExpectedTypeOrNull: function (val, type) {
            return val === null || val.constructor === type;
        },

        each: function (instance, fn, ctx) {
            var i, length, keys, key;

            if (Array.isArray(instance)) {
                for (i = 0, length = instance.length; i < length; i += 1) {
                    fn.call(ctx, instance[i], i);
                }
            } else if (this.isObject(instance)) {
                keys = Object.keys(instance);

                for (i = 0, length = keys.length; i < length; i += 1) {
                    key = keys[i];
                    fn.call(ctx, instance[key], key);
                }
            }
        },

        compact: function (array) {
            if (!Array.isArray(array)) return array;

            var result = [];
            this.each(array, function (val) {
                if (!_.isEmpty(val)) {
                    result.push(val);
                }
            });

            return result;
        },

        extend: function (obj, extendObj) {
            if (!(this.isObject(obj) || this.isObject(extendObj))) return;

            this.each(extendObj, function (val, key) {
                this[key] = val;
            }, obj);
        },

        format: function () {
            var args = arguments;
            var argsCount = args.length;
            var str = args[0];
            var data = args[1];

            if (argsCount === 2 && Array.isArray(data)) {
                var argumentsArray = data;
                argumentsArray.unshift(str);

                return this._formatArgs.apply(this, argumentsArray);
            } else if (argsCount === 2 && this.isObject(data)) {

                return this._formatObj(str, data);
            } else if (argsCount > 1) {

                return this._formatArgs.apply(this, args);
            }

            return str;
        }
    };

    function Rule(init) {
        if (!(_.isObject(init) && _.isFunction(init.type))) throw new Error('First argument must be an Object. Type must be defined.');
        _.extend(this, init);
    }

    function createNode(value, key, path, level, parent, pattern) {
        return {
            key: key,
            value: value,
            level: level,
            path: path || [],
            parent: parent,
            pattern: pattern
        };
    }

    function traverse(obj, fn) {
        if (!(_.isObject(obj) || _.isFunction(fn))) throw new Error('First should be an Object, second should be a Function');

        var circularDepend = [];
        var stack = [createNode(obj, null, null, 1, null, null)];

        function iterate(val, key) {
            var path = this.path.slice();
            var level = path.push(key);
            var node = createNode(val, key, path, level, this, null);
            var isCircular = circularDepend.indexOf(val) !== -1;

            if (_.isObject(val) && !isCircular) {
                stack.push(node);
                circularDepend.push(val);
            }

            fn(node, isCircular);
        }

        do {
            var node = stack.pop();
            _.each(node.value, iterate, node);
        } while (stack.length !== 0);
    }

    function prepareNode(val, key, pattern) {
        var path = this.path.slice();
        var level = path.push(key);
        return createNode(val, key, path, level, null, pattern);
    }

    function matchTraverse(obj, pattern) {
        if (!(_.isObject(obj) || _.isObject(pattern))) throw new Error('First and Second arguments should be an Object');

        var nodes = [];
        var stack = [{node: createNode(obj, null, null, 1, null, pattern), stage: pattern}];

        function iterate(stage, key) {
            var node, value;
            var pattern = this.pattern && this.pattern[_.isNumber(key) ? 0 : key];

            if (pattern === undefined) {
                return;
            } else if (pattern instanceof Rule) {
                value = this.value[key];

                if (pattern === value) {
                    value = undefined;
                }

                node = prepareNode.call(this, value, key, pattern);
                nodes.push(node);
                return;
            }

            if (_.isObject(pattern)) {
                value = this.value[key];
                value = _.isObject(value) ? value : pattern;
                node = prepareNode.call(this, value, key, pattern);
                stack.push({node: node, stage: value});
            }
        }

        do {
            var vertex = stack.pop();
            _.each(vertex.stage, iterate, vertex.node);
        } while (stack.length !== 0);

        return nodes;
    }

    function clean(options) {
        options = options || {};

        var allowNull = options.allowNull || false;

        this._nodes = this._nodes.filter(function (node) {
            var value = node.value;
            var pattern = node.pattern;
            return !_.isEmpty(value, allowNull, pattern.allowNull) && _.isExpectedTypeOrNull(value, pattern.type);
        });

        return this;
    }

    function build() {
        var root = this._isRootArray ? [] : {};
        var compactCache = [];
        var target;

        this._nodes.forEach(function (node) {
            var value = node.value;
            var pathes = node.path;
            target = root;

            for (var i = 0, length = pathes.length; i < length; i += 1) {
                var path = pathes[i];
                var nextPath = pathes[i + 1];

                if (target[path] === undefined) {
                    if (_.isNumber(nextPath)) {
                        compactCache.push({
                            target: target,
                            targetKey: path
                        });

                        target[path] = [];
                    } else if (nextPath !== undefined) {
                        target[path] = {};
                    } else {
                        target[path] = value;
                    }
                }

                target = target[path];
            }
        });

        compactCache.forEach(function (item) {
            var t = item.target;
            var tk = item.targetKey;
            t[tk] = _.compact(t[tk]);
        });

        return root;
    }

    function addToChain(methodName, method) {
        if (chainNs.hasOwnProperty(methodName)) {
            throw new Error(_.format('Method [${name}] already exist in chain', {
                name: methodName
            }));
        }

        if (!_.isFunction(method)) {
            throw new Error('Second argument must be a Function');
        }

        chainNs[methodName] = method.bind(chainNs);
    }

    function defineExtension(moduleName, providerFn, replaceIfExist) {
        if (this.hasOwnProperty(moduleName) && !replaceIfExist) {
            throw new Error(_.format('Module [${name}] already exist', {
                name: moduleName
            }));
        }

        if (!_.isFunction(providerFn)) {
            throw new Error('Provider must be a Function');
        }

        var extension = providerFn.call(this, _, addToChain);

        if (!_.isObject(extension)) {
            throw new Error('Provider function must return an Object');
        }

        this[moduleName] = extension;
    }

    _.extend(chainNs, {
        _isRootArray: null,
        _nodes: null,
        clean: (clean).bind(chainNs),
        build: (build).bind(chainNs)
    });

    _.extend(root, {
        matchTraverse: matchTraverse,
        traverse: traverse,
        defineExtension: defineExtension,

        rule: function (init) {
            return new Rule(init);
        },

        chain: function (obj, pattern) {
            chainNs._isRootArray = Array.isArray(obj);
            chainNs._nodes = matchTraverse(obj, pattern);
            return chainNs;
        },

        clean: function (obj, pattern, options) {
            return this.chain(obj, pattern).clean(options).build();
        }
    });

    return root;
})();

if (module && module.exports) {
    module.exports = ISSchemaTools;
} else {
    this.ISSchemaTools = ISSchemaTools;
}