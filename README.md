>	This pack contains various tools to work with JavaScript objects. It is created to help you avoid monotonous work such as extract data fields from JS object, transform values(trim, substring, replace, and etc..) and validate object schema fields.
>	The idea to create these tools came after long work with MeteorJS & MongoDB.

# How to install it?

```
  npm install isschematools
```

This pack of the three following modules:

1.  **Core Module**
    +   Methods:
        - **[traverse](#traversefn)**
        - **[matchTraverse](#matchtraversefn)**
        - **[vertex](#vertexfn)**
        - **[build](#buildfn)**
        - **[rule](#rulefn)**
        - **[chain](#chainfn)**
        - **[defineExtension](#defineextfn)**
2. 	**Transform Module**
    +   Methods:
        -   **transform**
        -   **register**
        -   **build**
    +   Properties:
        -   **transformers**
            +   **trim** / **trimRight** / **trimLeft**
            +   **substring** / **replace**
            +   **toUpper** / **toLower**
            +   **nullIfEmpty** / **default**
            +   **toType**
3. 	**Validation Module**
    +   Methods:
        -   **validate**
        -   **register**
        -   **messages**
    +   Existing validators
        -   **required**
        -   **type**
        -   **email**
        -   **url**
        -   **digits**
        -   **maxLength**
        -   **minLength**
        -   **eqlLength**
        -   **range**
        -   **equalTo**
        -   **belongsTo**
        
___

####	1. Core Module
  
>   `matchTraverse` & `traverse` functions are based on some variation of  BFS algorithm, and they do not use recursion

This module has the following methods:

___
####	-	<a name="traversefn"></a>Traverse Function

```javascript
	var t = require('isschematools');
	t.traverse(someObject, callback);
```
	
>   The first param should be an object.
>   The second param should be a callback function which will be invoked on each node of object
___
	
#####	Example:

```javascript
	/*
	*	var t = ISSchemaTools; //in browser
	*/
	var t = require('isschematools');
	
	var someObj = {
		prop1: 'Some data',
		prop2: 'Some other data',
		prop3: {
			prop1: [
				{
					insideProp1Prop3: 'Data'
				}
			]
		}
	};
	  
	t.traverse(someObj, function iterator(value, key, type, parentNode, isCircular) {
		console.log(value);
	});
	  
	// RESULT:
	//  'Some data' 
	//  'Some other data'
	//  {prop1: ...}
	//  [{insideProp1Prop3: ...}]
	//  {insideProp1Prop3: ...}
	//  'Data'
```
>	Where:
- **value** - value of processing node
- **key** - property name of processing node
- **type** - type of processing node
	* 'node' - type of `Object` or `Array`
	* 'leaf' - any type except `Object` or `Array`
- **parentNode** - reference on parent node (Object type). Has following props:
	* key - node key (property name)
	* value - node value (property value)
	* level - level of object (root level = 1)
	* path - array which consists of property keys from root object to current node 
	```javascript
		//for object 
		var object = {
			node1 : {
				node2: 'value'
			}
		};
		
		//path for value in node2 will be ['node1', 'node2'];
	```
	* parent - reference on parent node
- **isCircular** - shows if value of this node is circular reference
  
___
####	-	<a name='matchtraversefn'></a>MatchTraverse Function

```javascript

	/*
	*	var t = ISSchemaTools; //in browser
	*/
	var t = require('isschematools');
	t.matchTraverse(someObject, pattern);
```
		
>	The first param is an object for `traverse`.
>	The second param should be a pattern that describes expected structure of an object.
`matchTraverse` allows to traverse an object using special pattern.

>	<a name="vertexfn"></a>Pattern should describe desired structure of object. Each end node of pattern should be a Vertex or Rule.
>	Rule can contain additional info about end node.
		
```javascript

	/*
	*	var t = ISSchemaTools; //in browser
	*/
	var t = require('isschematools'); 
	var pattern = {
		name: t.vertex(),
		surname: t.vertex(),
		nested: {
			nested: {
				value: t.vertex()
			}
		}
	};
	
```

#####	Example:
```javascript
	/*
		*	var t = ISSchemaTools; //in browser
	*/
	var t = require('isschematools');
	
	var model = {
		name: 'Sam',
		surname: 'Wartington',
		contact: {
			isPrimary: true,
			city: null,
			phones: ['+000 11 000 22 22'],
			address: [{
				street: 'Calouss',
				building: 9,
				room: 10
			}]
		}
	};
	  
	var pattern = {
		name: t.vertex(),
		surname: t.vertex(),
		contact: {
			city: t.vertex(),
			phones: [t.vertex()],
			address: [{
				street: t.vertex(),
				building: t.vertex(),
				room: t.vertex()
			}]
		}
	};
	  
	//returns array of nodes which are defined by pattern
	var nodeList = t.matchTraverse(model, pattern);
	
	var cleanNodeList = nodeList.filter(function (node) {
		return !(node.value === undefined || node.value === null);
	});
	
	var result = cleanNodeList.map(function (node) { return node.value; });
	/*
	  result -> ['Sam', 'Wartington', '+000 11 000 22 22', 9, 10, 'Calouss']
	*/
	
	/*
	  node has following structure: 
	  	* value: value of processed node,
	  	* key: property name of processed node,
	  	* level - level of object (root level = 1),
	    * path - array which consists of property keys from root object to current node,
	    * pattern - pattern describes current node (Vertex means empty pattern type)
	*/
	
	
	result = t.build(nodeList);
	
	/*
	result -> {
		name: 'Sam',
		surname: 'Wartington',
		contact: {
			phones: ['+000 11 000 22 22'],
			address: [{
			  street: 'Calouss',
			  building: 9,
			  room: 10
			}]
		}
	}
	*/
```

___
####	-	<a name='rulefn'></a>Rule Function

>	Pattern for the `matchTraverse` function can be defined by using rules. Rule is some kind of metadata which is describe a field, and can be used for your processing functions or other needs.
>	You can declare rule by using `t.rule` function. You should pass in `t.rule` expected type of data, which is contained in node. Type of expected data is only one required param for `t.rule` function.

```javascript
	t.rule({type: Array}); //type must be a Ctor function
	t.rule(Array); //Short declaration
```
####    Example:
```javascript
	/*
	*   var t = ISSchemaTools; //in browser
	*/
	var t = require('isschematools');
	var model = {
		name: 'John',
		surname: 'Doe',
		contact: {
		 	city: 'Minsk'
		 }
	};
	
	var pattern = {
		name: t.rule({
			type: String
		}),
		surname: t.rule({
			type: String
		}),
		contact: {
			city: t.rule({
				type: String
				mymetadata: ['My Meta'],
				mymeta: 'My Meta'
			})
		}
	};
	
	var nodes = t.matchTraverse(model, pattern);
	
	nodes = nodes.filter(function (node) {
		return !!node.pattern.mymeta;
	});
	
	var result = t.build(nodes);
	/*
		result => {
			contact: {
				city: 'Minsk'
			}
		}
	*/
```


> Besides `type` you can use following options(#reserved) inside a `t.rule`:
-	[omit](#buildfnomit) 			(Boolean | Function:Boolean)
-	name 			(String)
-	label 			(String)
-	type 			(Function)
-	transform 		(Array)
-	validation 		(Object)
-	[allowNull](#buildfnallownull)		(Boolean)



```javascript
	var t = ISSchemaTools || require('isschematools');
	var tr = t.transform.transformers;
	
	t.rule({
		omit: true,															//More details in description of build function 
		name: 'Name',														//Name of node (more details #Validation Module)
		label: 'LabelName',													//Alias for field (more details #Validation Module)
		type: (String, Boolean, Function, Object, Array, Number, RegExp), 	//Any named constructor function
		transform: [tr.trim], 												//Array of transformer methods (more details will be pointed out in description for #Transform Module)
		validation: { 														//Object with validation rules (more details will be pointed out in description for #Validation Module)
			required: true
		}
	})
```
	
####	-	<a name="buildfn"></a>Build Function



>	`t.build` function provides ability to gather result of `matchTraveres` into new object.
Lets try to find out how should we work with it:

```javascript
	var t = require('isschematools');
	var listOfNodes = t.matchTraverse(__obj__, __pattern__);
	var result = t.build(listOfNodes, __options__);
```
> Where:
*	listOfNodes - result of `t.matchTraverse` function
*	options
	+	clean		- can be `true` or `false`, if value is `true` then nodes which obey following rules will be excluded:
		*	value is (NaN, Infinite, undefined, "" or null*)
		*	type of value is incorrect
		*	omit value for node is equal `true`, or omit function gives `true`
	+	<a name="buildfnallownull"></a>allowNull	-	global identifier which is used to save values with `null` in result object
	
```javascript
	var t = require('isschematools'); //var t = ISSchemaTools;
	
	var listOfNodes = t.matchTraverse({
		name: 'slim',
		surname: 'shady',
		city: undefined,
		country: null
	}, {
		name: t.rule(String), // Short declaration of rule the same {type: String} 
		surname: t.rule(String),
		city: t.rule({
			type: String
		}),
		country: t.rule({
			type: String
		})
	});
	
	t.build(listOfNodes); // => {name: 'slim', surname: 'shady', city: undefined, country: null}
	t.build(listOfNodes, {clean: true}); // => {name: 'slim', surname: 'shady'}
	t.build(listOfNodes, {clean: true, allowNull: true}); // => {name: 'slim', surname: 'shady', country: null}
	
	//***********//
	
	listOfNodes = t.matchTraverse({
		name: null,
		surname: null,
		password: '1234567',
		confirmPassword: '1234567'
	}, {
		name: t.rule({
			type: String
		}),
		surname: t.rule({
			type: String,
			allowNull: true
		}),
		password: t.rule({
			type: String
		}),
		confirmPassword: t.rule({
			type: String,
			omit: true,
			validation: {
				equalTo: 'password'
			}
		})
	});
	
	t.build(listOfNodes, {clean: true}); //=> {surname: null, password: '1234567'}
	
	listOfNodes = t.matchTraverse({
		name: 'Stringify',
		surname: 'Dodood'
	}, {
		name: t.rule({
			type: String
			omit: function (node) {
				return node.value === 'Stringify';
			}
		}),
		surname: t.rule({
			type: String,
			omit: function (node) {
				return node.value === 'Dorbonsky';
			}
		})
	});
	
	t.build(listOfNodes, {clean: true}); // => {surname: 'Dodood'}
	
```

####	-	<a name="chainfn"></a> Chain Function

Creates a `Chain` object that wraps value with explicit method chaining enabled.
Returns `Chain wrapper object`.

```javascript
	t.chain(model, pattern); // => `Chain object`
```

Example:

```javascript
	
	var model = {
		filter: {
			name: 'Jo%%%%',
			surname: '%%urndina%%'
			age: {$lt: 18}
		}
		order: {
			name: 1
		}
	};
	
	var pattern = {
		filter: {
			name: t.rule(String),
			surname: t.rule(String),
			age: t.rule(Object)
		}
	};
	
	t.chain(model, pattern).build({clean: true, allowNull: true});
	/*
		{
			filter: {
				name: 'Jo%%%%',
				surname: '%%urndina%%',
				age: {$lt: 18}
			}
		}
	*/
```

####	-	<a name="defineextfn"></a >DefineExtensison Function
```javascript
	t.defineExtension(extensionName, function providerFn (...) { ... });
```

Function defines module extension. Accepted params: 'module name', init function that returns (module) with methods.

#### Example:
```javascript
	var t = require('isschematools');
	t.defineExtension('superduper', function (_) { // _ -> small set of utils (look at tests for core module)
		function superduper(opts) {
			_.each(this._nodes, function (node) {
				var metadata = node.pattern.superduper;
				if(_.isString(metadata)) {
					node.value = [metadata, node.value, metadata].join('-');
				}
			});
			
			return this;
		}
		
		this.addMethodToChain('superduper', superduper);
		
		return {
			superduper: function (model, pattern, opts) {
				return t.chain(model, patter).superduper(opts).build(opts);
			}
		};
	});
	
	var model = {
		name: 'SomeName',
		surname: 'SomeSurname'
	};
	
	var pattern = {
		name: t.rule({
			type: String,
			superduper: '@!!!@'
		}),
		surname: t.rule({
			type: String
		})
	};
	
	var result = t.chain(model, pattern).superduper().build({clean: true});
	
	/*
		result => {
			name: '@!!!@-SomeName-@!!!@',
			surname: 'SomeSurname'
		}
	*/
```

#### 2. Transform Module
#### 3. Validation Module

## DOCS IN PROGRESS
