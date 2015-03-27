
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
        console.log(nodeValue);
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
      - **value** - passing node value
      - **key** - passing node key
      - **type** - passing node type
        * 'node' - value has type of `Object` or `Array`
        * 'leaf' - value of any type except `Object` or `Array`
      - **parentNode** - reference on parent node (Object type). Has following props:
        * key - node key (property name)
        * value - node value (property value)
        * level - level of object (root level = 1)
        * path - array which consists of property keys from root object to current node 
        * parent - reference on parent node
      - **isCircular** - value of this node is circular reference
      
  - #### MatchTraverse Function
    ___
    ```javascript
      var t = require('isschematools');
      t.matchTraverse(someObject, pattern);
    ```
    
    The first param is an object for `traverse`.
    The second param should be a pattern that describes expected structure of an object.
    `matchTraverse` allows to traverse an object using special pattern!
    
    ___
    ##### Example
    ```javascript
      //In Progress
      //You can look inside test folder and find some examples of usage
    ```
    
#### 2. Transform Module
#### 3. Validation Module
