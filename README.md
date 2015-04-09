<img src="http://screencast.com/t/aDQvCGVWA3Xr"/>

This pack contains various tools to work with JavaScript objects. It is created to help you avoid monotonous work such as extract data fields from JS object, transform values(trim, substring, replace, and etc..) and validate object schema fields.
The idea to create these tools came after long work with MeteorJS & MongoDB.

# How to install it?
```javascript
  npm install isschematools
```

This pack of the three following modules:
  1. **Core Module**
	* **Methods:**
	  * *traverse*
	  * *matchTraverse*
	  * *vertex*
	  * *build*
	  * *rule*
	  * *chain*
	  * *defineExtension*
  2. **Transform Module**
  3. **Validation Module**


#### 1. Core Module
  
  
 `matchTraverse` & `traverse` functions are based on some variation of  BFS algorithm, and they do not use recursion

  This module has the following methods:
  - #### Traverse Function
    ___
    ```javascript
      var t = require('isschematools');
      t.traverse(someObject, callback);
    ```
    The first param should be an object.
    The second param should be a callback function which will be invoked on each node of object
    ___
    ##### Example
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
    Where:
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
      
  - #### MatchTraverse Function
    ___
    ```javascript

      /*
      *	var t = ISSchemaTools; //in browser
      */
      var t = require('isschematools');
      t.matchTraverse(someObject, pattern);
    ```
    
    The first param is an object for `traverse`.
    The second param should be a pattern that describes expected structure of an object.
    `matchTraverse` allows to traverse an object using special pattern.
    
    Pattern should describe desired structure of object. Each end node of pattern should be a Vertex or Rule.
    Rule can contain additional info about end node.
	
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
    ___
    ##### Example
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
    
  - #### Rule Function
	
	Pattern for the `matchTraverse` function can be defined by using rules. Rule is some kind of metadata which is describe a field, and can be used for your processing functions or other needs.
	You can declare rule by using `t.rule` function. You should pass in `t.rule` expected type of data, which is contained in node. Type of expected data is only one required param for `t.rule` function.
	```javascript
	t.rule({type: Array}); //type must be a Ctor function
	t.rule(Array); //Short declaration
	```

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
	
	
	
	- #### Build Function
	
	- #### Chain Function
	
	- #### DefineExtensison Function
 
## DOCS IN PROCESS
    
#### 2. Transform Module
#### 3. Validation Module
