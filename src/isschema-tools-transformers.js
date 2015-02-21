var ISSchemaTools = require('./isschema-tools-core');

ISSchemaTools.defineExtension('transform', function (_, addToChain) {

    var self = this;
    var module = {};
    var transformers = {};

    function register(transformerName, method) {
        if (transformers.hasOwnProperty(transformerName)) {
            throw new Error(_.format('Transformer ${0} already exist', transformerName));
        }

        if (!_.isFunction(method)) {
            throw new Error('Second argument is not a Function');
        }

        transformers[transformerName] = method;
    }

    function build(method, hasParams) {
        if (!_.isFunction(method)) {
            throw new Error('Argument is not a Function');
        }

        if (hasParams) {
            return function (params) {
                return method.bind(null, params);
            };
        }

        return method;
    }

    function iterateNode(node) {
        var transformers = node.pattern.transformers;

        if (Array.isArray(transformers)) {
            for (var i = 0, length = transformers.length; i < length; i += 1) {
                var transformer = transformers[i];
                node.value = transformer(node.value, node.key);
            }
        }
    }

    function transform() {
        this._nodes.forEach(iterateNode);
        return this;
    }

    addToChain('transform', transform);

    register('trim', build(function (value) {
        return String.prototype.trim.call(value);
    }));

    register('trimLeft', build(function (value) {
        return String.prototype.trimLeft.call(value);
    }));

    register('trimRight', build(function (value) {
        return String.prototype.trimRight.call(value);
    }));

    register('substring', build(function (params, value) {
        return String.prototype.substring.call(value, params[0], params[1]);
    }, true));

    register('replace', build(function (params, value) {
        return String.prototype.replace.call(value, params[0], params[1]);
    }, true));

    register('toUpper', build(function (value) {
        return String.prototype.toUpperCase.call(value);
    }));

    register('toLower', build(function (value) {
        return String.prototype.toLowerCase.call(value);
    }));

    register('toStringType', build(function (value) {
        return value.toString();
    }));

    register('nullIfEmpty', build(function (value) {
        return _.isEmpty(value) ? null : value;
    }));

    _.extend(module, {
        transformers: transformers,
        register: register,
        build: build,
        transform: function () {
            return self.chain(obj, pattern).transform().build();
        }
    });

    return module;
});