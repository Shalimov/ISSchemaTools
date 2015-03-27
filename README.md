
This pack contains various tools to work with JavaScript object. It is created to help you avoid monotonous work such as extract data fields from JS object, transform values(trim, substring, replace, and etc..) and validate object schema fields.
The idea to create these tools came after long work with MeteorJS & MongoDB.

#How to install it?
```javascript
  npm install isschematools
```

This pack consists of the three following modules:
  1. **Core Module**
  2. **Transform Module**
  3. **Validation Module**


#### 1. Core Module

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
      
      t.traverse(someObj, function iterator(leafValue, leafKey, parentNode, isCircular) {
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
      
<h4><strong>2.</strong>Transform Module</h4>
<h4><strong>3.</strong>Validation Module</h4>
