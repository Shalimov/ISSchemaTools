<p>This pack contains various tools to work with JavaScript object. It is created to help you avoid monotonous work such as extract data fields from JS object, transform values(trim, substring, replace, and etc..) and validate object schema fields.
The idea to create these tools came after long work with MeteorJS & MongoDB.</p>

<h2>How to install it?</h2>

<code>npm install isschematools</code>

<p>This pack consists of the three following modules:</p>
<ol>
  <li>
    <strong>Core Module</strong>
  </li>
  <li>
    <strong>Transform Module</strong>
  </li>
  <li>
    <strong>Validation Module</strong>
  </li>
</ol>


<section>
  <h4><strong>1.</strong>Core Module</h4>
  <p>This module has the following methods:</p>
  <ul>
    <li>
      <h4>Traverse Function</h4>
      <hr />
      <code>
        var t = require('ISSchemaTools');
      </code>
      <br/>
      <code>
        t.traverse(someObject: Object, callback: Function);
      </code>
      <p>
        The first param should be an object.
        The second param should be a callback function which will be invoked on each node of object
      </p>
      <hr/>
      <h5>Example</h5>
    </li>
  </ul>
</section>
<h4><strong>2.</strong>Transform Module</h4>
<h4><strong>3.</strong>Validation Module</h4>
