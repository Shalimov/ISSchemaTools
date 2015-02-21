var ISSchemaTools = require('./isschema-tools-core');

ISSchemaTools.defineExtension('validate', function (_, addToChain) {

    var self = this;
    var module = {};
    var validators = {};

    var messages = {
        'required': '${0} is required',
        'invalid': '${0} is invalid',
        'minLength': '${0} must have length at least ${2}',
        'maxLength': '${0} must have length at most ${2}',
        'eqlLength': '${0} must have length eql ${2}',
        'range': '${0} must be between ${2} and ${3}'
    };

    function register(validatorName, method) {
        if (validators.hasOwnProperty(validatorName)) {
            throw new Error(_.format('Validator ${0} already exist', validatorName));
        }

        if (!_.isFunction(method)) {
            throw new Error('Second argument is not a Function');
        }

        validators[validatorName] = method;
    }

    function build(method, hasParams) {
        if (!_.isFunction(method)) {
            throw new Error('Argument is not a Function');
        }

        if (hasParams) {
            return function (params) {
                return function (val, key) {
                    var descriptor = method(val, key, params);

                    return descriptor && {
                        descriptor: descriptor,
                        params: params
                    };
                };
            };
        }

        return method;
    }

    function iterateNode(node) {
        var pattern = node.pattern;
        var validators = pattern.validators;

        if (Array.isArray(validators)) {

            var detailed = this.detailed;
            var key = node.key;
            var value = node.value;
            var label = pattern.label || key;

            for (var i = 0, length = validators.length; i < length; i += 1) {
                var validator = validators[i];
                var error = validator(value, key);

                if (error === null) {
                    continue;
                }

                var message = messages[error.descriptor] || messages['invalid'];
                var params = error.params;

                params.unshift(label, value);
                message = _.format(message, params);

                return detailed ? {
                    key: key,
                    value: value,
                    message: message
                } : message;
            }
        }

        return null;
    }

    function validate(options) {
        options = options || {detailed: false};

        return this._nodes.map(iterateNode.bind(options));
    }

    addToChain('validate', validate);

    _.extend(module, {
        register: register,
        build: build,
        messages: function (extMessages) {
            if (!_.isObject(extMessages)) {
                throw new Error('First argument should be an Object');
            }

            _.extend(messages, extMessages);
        }
    });

    return module;
});