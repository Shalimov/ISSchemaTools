(function () {
	//TODO: Added stage rules
	//TODO: Added more detailed test & documentation
	//TODO: Added performance tests
	var ISSchemaTools = (function () {
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

			isString: function (val) {
				return this._toString.call(val) === '[object String]';
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

			first: function (array) {
				return Array.isArray(array) ? array[0] : array;
			},

			identity: function (val) {
				return val;
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

			map: function (instance, fn, ctx) {
				var result = [];

				this.each(instance, function () {
					result.push(fn.apply(this, arguments));
				}, ctx);

				return result;
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

				return obj;
			},

			groupBy: function (array, groupPredicate, identityPredicate) {
				var resultSet = {};

				identityPredicate = identityPredicate || this.identity;

				array.forEach(function (val, key) {

					var property = groupPredicate(val, key);
					val = identityPredicate(val);

					if (resultSet.hasOwnProperty(property)) {
						resultSet[property].push(val);
					} else {
						resultSet[property] = [val];
					}
				});

				return resultSet;
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
			_.extend(this, _.extend({
				omit: false,
				name: null,
				label: null,
				transform: null,
				validation: null,
				type: null
			}, init));
		}

		function filterIsNotNumberCallback(val) {
			return !_.isNumber(val);
		}

		function createRuleName(path) {
			return path.filter(filterIsNotNumberCallback).join('.');
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
			if (!(_.isObject(obj) && _.isFunction(fn))) {
				throw new Error('First should be an Object, second should be a Function');
			}

			var circularDepend = [];
			var stack = [createNode(obj, null, null, 1, null, null)];

			function iterate(val, key) {
				var isCircular = false;
				var type = 'leaf';
				if (_.isObject(val)) {
					var path = this.path.slice();
					var level = path.push(key);
					var node = createNode(val, key, path, level, this, null);

					isCircular = circularDepend.indexOf(val) !== -1;
					type = 'node';

					if (!isCircular) {
						stack.push(node);
						circularDepend.push(val);
					}
				}

				fn(val, key, type, this, isCircular);
			}

			do {
				var node = stack.pop();
				_.each(node.value, iterate, node);
			} while (stack.length !== 0);
		}

		function prepareNode(val, key, pattern) {
			var path = this.path.slice();
			var level = path.push(key);

			pattern.name = pattern.name || createRuleName(path);

			return createNode(val, key, path, level, null, pattern);
		}

		function matchTraverse(obj, pattern) {
			if (!(_.isObject(obj) && _.isObject(pattern))) throw new Error('First and Second arguments should be an Object');

			var nodes = [];
			var stack = [{
				node: createNode(obj, null, null, 1, null, pattern),
				stage: pattern
			}];

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
					stack.push({
						node: node,
						stage: value
					});
				}
			}

			do {
				var vertex = stack.pop();
				_.each(vertex.stage, iterate, vertex.node);
			} while (stack.length !== 0);

			return nodes;
		}

		function build() {
			var root = {};
			var compactCache = [];
			var nodes, target, allowNull, options;

			//Method is invoked as part of chain
			if (this === chainNs) {
				nodes = this._nodes;
				options = arguments[0];
			} else {
				nodes = arguments[0];
				options = arguments[1];
			}

			options = _.extend({
				clean: false,
				allowNull: false
			}, options);

			if (options.clean) {
				allowNull = options.allowNull;

				nodes = nodes.filter(function (node) {
					var value = node.value;
					var pattern = node.pattern;

					if (_.isFunction(pattern.omit)) {
						return !pattern.omit(node);
					} else if (_.isBoolean(pattern.omit)) {
						return !pattern.omit;
					}

					return !_.isEmpty(value, allowNull, pattern.allowNull) && _.isExpectedTypeOrNull(value, pattern.type);
				});
			}

			nodes.forEach(function (node) {
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

			var extension = providerFn.call({addMethodToChain: addToChain}, _);

			if (!_.isObject(extension)) {
				throw new Error('Provider function must return an Object');
			}

			this[moduleName] = extension;
		}

		_.extend(chainNs, {
			//_isRootArray: null,
			_nodes: null,
			build: (build).bind(chainNs)
		});

		_.extend(root, {
			matchTraverse: matchTraverse,
			traverse: traverse,
			defineExtension: defineExtension,
			build: build,
			vertex: function () {
				return new Rule();
			},

			rule: function (init) {
				if (_.isFunction(init)) {
					init = {
						type: init
					};
				} else if (!(_.isObject(init) && _.isFunction(init.type))) {
					throw new Error('First argument must be an Object or Constructor. Type must be defined.');
				}

				return new Rule(init);
			},

			chain: function (obj, pattern) {
				chainNs._isRootArray = Array.isArray(obj);
				chainNs._nodes = matchTraverse(obj, pattern);
				return chainNs;
			}
		});

		return root;
	})();

	//Transformers declaration
	ISSchemaTools.defineExtension('transform', function (_, addToChain) {
		var self = this;
		var module = {};
		var transformers = {};

		function iterateNode(node) {
			var transformers = node.pattern.transform;

			if (Array.isArray(transformers)) {
				for (var i = 0, length = transformers.length; i < length; i += 1) {
					var transformer = transformers[i];
					node.value = transformer(node.value, node.key, node.pattern.type);
				}
			}
		}

		function transform() {
			this._nodes.forEach(iterateNode);
			return this;
		}

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

		register('trim', build(function (val) {
			return _.isString(val) ? val.trim() : val;
		}));

		register('trimLeft', build(function (val) {
			return _.isString(val) ? val.trimLeft() : val;
		}));

		register('trimRight', build(function (val) {
			return _.isString(val) ? val.trimRight() : val;
		}));

		register('substring', build(function (params, val) {
			return _.isString(val) ? val.substring(params[0], params[1]) : val;
		}, true));

		register('replace', build(function (params, val) {
			return _.isString(val) ? val.replace(params[0], params[1]) : val;
		}, true));

		register('toUpper', build(function (val) {
			return _.isString(val) ? val.toUpperCase() : val;
		}));

		register('toLower', build(function (val) {
			return _.isString(val) ? val.toLowerCase() : val;
		}));

		register('toType', build(function (value, key, type) {
			return type(value);
		}));

		register('default', build(function (params, value) {
			return _.isEmpty(value) ? _.first(params) : value;
		}, true));

		register('nullIfEmpty', build(function (value) {
			return _.isEmpty(value) ? null : value;
		}));

		this.addMethodToChain('transform', transform);

		_.extend(module, {
			transformers: transformers,
			register: register,
			build: build,
			transform: function (buildOpts) {
				return self.chain(obj, pattern).transform().build(buildOpts);
			}
		});

		return module;
	});

	ISSchemaTools.defineExtension('validation', function (_) {
		var module = {};
		var validators = {};
		var regexPatterns = {
			email: /^([\w\-\.]+)@((\[[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.)|(([\w\-]+\.)+))([a-zA-Z]{2,4}|\d{1,3})(\]?)$/,
			digits: /^\d+$/,
			url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
		};

		var messages = {
			'required': '${0} is required',
			'invalid': '${0} is invalid',
			'belongsTo': '${0} must be one of (${2})',
			'minLength': '${0} must have length at least ${2}',
			'maxLength': '${0} must have length at most ${2}',
			'eqlLength': '${0} must have length eql ${2}',
			'range': '${0} must be between ${2} and ${3}',
			'email': '${0} must be correct',
			'type': '${0} must have appropriate type',
			'digits': '${0} must contain only digits',
			'url': '${0} must contain correct url of resource'
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

		function validate(options) {
			var errors = [];
			var nodes = this._nodes;
			var detailed = !!options && options.detailed;

			var ruleValues = _.groupBy(nodes, function (node) {
				return node.pattern.name;
			}, function (node) {
				return node.value;
			});

			_.each(nodes, function iterateNode(node) {
				var pattern = node.pattern;
				var validateObj = pattern.validation;

				if (!_.isObject(validateObj)) {
					return;
				}

				var value = node.value;
				var label = pattern.label || pattern.name;
				var keys = Object.keys(validateObj);
				var validatorName, validator, params, validatorMessage, args;

				for (var i = 0, length = keys.length; i < length; i += 1) {
					validatorName = keys[i];
					validator = validators[validatorName];
					args = params = validateObj[validatorName];

					if (!_.isFunction(validator)) {
						throw new Error(_.format('Validator ${0} must be defined', validatorName));
					} else if (_.isEmpty(params) || (_.isBoolean(params) && !params)) {
						continue;
					}

					if (!Array.isArray(params) && _.isObject(params)) {
						args = params.args || params;
						validatorMessage = params.message;
					}

					if (validator(value, args, ruleValues, pattern) === true) {
						continue;
					}

					if (!validatorMessage) {
						validatorMessage = messages[validatorName] || messages.invalid;
					}

					if(_.isFunction(validatorMessage)) {
						validatorMessage = validatorMessage(label, value, args, pattern.type.name);
					} else if(_.isString(validatorMessage)){
						validatorMessage = _.format(validatorMessage, label, value, args, pattern.type.name);
					}

					errors.push(detailed ? {
						ruleName: pattern.name,
						key: node.key,
						value: value,
						error: validatorMessage
					} : validatorMessage);

					break;
				}
			});

			return errors.length ? errors : null;
		}

		register('required', function (val) {
			return !_.isEmpty(val);
		});

		register('type', function (val, arg, ruleValues, pattern) {
			return (_.isEmpty(val) && val !== '') || _.isExpectedTypeOrNull(val, pattern.type);
		});

		register('email', function (val) {
			return _.isEmpty(val) || regexPatterns.email.test(val);
		});

		register('digits', function (val) {
			return _.isEmpty(val) || regexPatterns.digits.test(val);
		});

		register('url', function (val) {
			return _.isEmpty(val) || regexPatterns.url.test(val);
		});

		register('minLength', function (val, minLength) {
			return _.isEmpty(val) || val.length >= minLength;
		});

		register('maxLength', function (val, maxLength) {
			return _.isEmpty(val) || val.length <= maxLength;
		});

		register('eqlLength', function (val, eqlLength) {
			return _.isEmpty(val) || val.length === eqlLength;
		});

		register('range', function (val, minMax) {
			var min = minMax[0];
			var max = minMax[1];

			return _.isEmpty(val) || (_.isNumber(val) && min < val && val < max);
		});

		register('equalTo', function (val, ruleName, ruleValues) {
			return val === _.first(ruleValues[ruleName]);
		});

		register('belongsTo', function (val, values) {
			return _.isEmpty(val) || values.indexOf(val) !== -1;
		});

		this.addMethodToChain('validate', validate);

		_.extend(module, {
			register: register,
			messages: function (extMessages) {
				if (!_.isObject(extMessages)) {
					throw new Error('First argument should be an Object');
				}

				_.extend(messages, extMessages);
			},
			validate: function (obj, pattern, options) {
				return this.chain(obj, pattern).validate(options);
			}
		});

		return module;
	});

	// Export the ISSchemaTools object for **Node.js**, with
	// backwards-compatibility for the old `require()` API. If we're in
	// the browser, add `ISSchemaTools` as a global object.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = ISSchemaTools;
		}
		exports.ISSchemaTools = ISSchemaTools;
	} else {
		this.ISSchemaTools = ISSchemaTools;
	}
})();
