ISSchemaTools = (function () {
	var _ = {
		_toString: Object.prototype.toString,

		isFunction: function (func) {
			return func && this._toString.call(func) === '[object Function]';
		},

		isObject: function (obj) {
			return typeof obj === 'object' && obj !== null;
		},

		isNumber: function (n) {
			return this._toString.call(n) === '[object Number]' && !isNaN(n) && isFinite(n);
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

			return isNull || val === undefined || val === "" || val !== val;
		},

		expectedTypeOrNull: function (val, type) {
			return val === null || val.constructor === type;
		},

		each: function (obj, fn, ctx) {
			var i, length, keys;

			if (Array.isArray(obj)) {
				for (i = 0, length = array.length; i < length; i += 1) {
					fn.call(ctx, array[i], i);
				}
			} else if (this.isObject(obj)) {
				keys = Object.keys(obj);
				for (i = 0, length = keys.length; i < length; i += 1) {
					var key = keys[i];
					fn.call(ctx, obj[key], key);
				}
			}
		},

		compact: function (array) {
			if (!Array.isArray(array)) return array;
			var result = [];

			for (var i = 0, length = array.length; i < length; i += 1) {
				if (val !== null && val !== undefined && val !== "" && val === val) {
					result.push(array[i]);
				}
			}

			return result;
		},

		extend: function (obj, extendObj) {
			if (!(this.isObject(obj) || this.isObject(extendObj))) return;

			this.each(extendObj, function (val, key) {
				this[key] = val;
			}, obj);
		}
	};

	function Rule(init) {
		if (!_.isFunction(init.type)) throw new Error('Type must be defined');
		_.extend(this, init);
	}

	function ObjNode(key, value, level, path, parent, pattern) {
		this.key = key;
		this.value = value;
		this.level = level;
		this.path = path || [];
		this.parent = parent;
		this.pattern = pattern;
	}

	function createNode(val, key, path, level, parent, pattern) {
		return new ObjNode(key, val, level, path, parent, pattern);
	}

	function rule(init) {
		if (!_.isObject(init)) throw new Error('Rule should be an Object type');
		return new Rule(init);
	}

	function traverse(obj, fn) {
		if (!(_.isObject(obj) || _.isFunction(fn))) throw new Error('First should be an object, second should be a Function');

		var circularDepend = [];
		var stack = [createNode(obj, null, null, 1, null, null)];

		function iterate(val, key) {
			var path = this.path.slice();
			var level = path.push(key);
			var node = createNode(val, key, path, level, this, null);
			var isCircular = circularDepend.indexOf(val) === -1;

			if (!_.isFunction(val) && _.isObject(val) && isCircular) {
				stack.push(node);
				circularDepend.push(node);
			}

			fn(node, isCircular);
		}

		do {
			var node = stack.pop();
			_.each(node.value, iterate, node);
		} while (stack.length !== 0);
	}

	function matchTraverse(obj, pattern) {
		if (!(_.isObject(obj) || _.isObject(pattern))) throw new Error('First and Second arguments should be an object');

		var nodes = [];
		var stack = [createNode(obj, null, null, 1, null, pattern)];

		function iterate(val, key) {
			var path = this.path.slice();
			var level = path.push(key);
			var pattern = this.pattern && this.pattern[_.isNumber(key) ? 0 : key];
			var node = createNode(val, key, path, level, this, pattern);

			if (pattern === undefined) {
				return;
			} else if (pattern instanceof Rule) {
				nodes.push(node);
				return;
			}

			if (!_.isFunction(val) && _.isObject(val)) {
				stack.push(node);
			}
		}

		do {
			var node = stack.pop();
			_.each(node.value, iterate, node);
		} while (stack.length !== 0);

		return nodes;
	}

	function clean(nodes, options) {
		var target;
		var result = {};
		var compactCache = [];

		options = options || {};

		var allowNull = options.allowNull;

		nodes.forEach(function (node) {
			var value = node.value;
			var pattern = node.pattern;

			if (!_.isEmpty(value, allowNull, pattern.allowNull) && _.expectedTypeOrNull(value, pattern.type)) {

				var pathes = node.path;
				target = result;

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
			}
		});

		compactCache.forEach(function (item) {
			var t = item.target;
			var tk = item.targetKey;
			t[tk] = _.compact(t[tk]);
		});

		return result;
	}

	function ISSchemaTools(obj, pattern) {
		var nodes = matchTraverse(obj, pattern);

		return {
			clean: (clean).bind(null, nodes)
		}
	};

	_.extend(ISSchemaTools, {
		rule: rule,
		matchTraverse: matchTraverse,
		traverse: traverse,
		clean: function (obj, pattern, options) {
			var nodes = matchTraverse(obj, pattern);
			return clean(nodes, options);
		}
	});

	return ISSchemaTools;
})();