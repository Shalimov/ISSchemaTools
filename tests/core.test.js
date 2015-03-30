var t = require('../src/isschema-tools');

//TODO: Added tests for groupBy, map, identity, first
//Added accurate tests
//Added test for Omit params
//Added test for rule params
//Added performance tests and etc..

describe('test core methods of ISSchemaTools', function () {

    describe('test small set of underscore/lodash functions', function () {
        var _;

        before(function () {
            t.defineExtension('test', function (u) {
                _ = u;
                return _;
            });
        });

        it('test defineExtension of function', function () {
            t.should.have.property('test');
        });

        it('test existence of small set of functions of underscore/lodash', function () {
            _.should.have.keys(['_toString', '_formatArgs', '_formatObj', 'first', 'groupBy', 'map', 'identity', 'isNaN', 'isString', 'isFunction', 'isObject', 'isNumber', 'isBoolean', 'isEmpty', 'isExpectedTypeOrNull', 'each', 'compact', 'extend', 'format']);

            _.should.matchEach(function (it) {
                it.should.be.a.Function;
            });
        });

        it('test _#isNaN', function () {
            _.isNaN(Function).should.be.false;
            _.isNaN("string").should.be.false;
            _.isNaN("NaN").should.be.false;
            _.isNaN(1).should.be.false;
            _.isNaN({}).should.be.false;
            _.isNaN([]).should.be.false;
            _.isNaN(Infinity).should.be.false;
            _.isNaN(false).should.be.false;
            _.isNaN(true).should.be.false;
            _.isNaN(undefined).should.be.false;
            _.isNaN(null).should.be.false;
            _.isNaN(NaN).should.be.true;
        });

        it('test _#isString', function () {
            _.isString(Infinity).should.be.false;
            _.isString(false).should.be.false;
            _.isString(true).should.be.false;
            _.isString(NaN).should.be.false;
            _.isString(Function).should.be.false;
            _.isString(undefined).should.be.false;
            _.isString(null).should.be.false;
            _.isString([]).should.be.false;
            _.isString({}).should.be.false;
            _.isString(1).should.be.false;
            _.isString("string").should.be.true;
            _.isString("NaN").should.be.true;
        });

        it('test _#isFunction', function () {
            _.isFunction("string").should.be.false;
            _.isFunction("NaN").should.be.false;
            _.isFunction(1).should.be.false;
            _.isFunction({}).should.be.false;
            _.isFunction([]).should.be.false;
            _.isFunction(Infinity).should.be.false;
            _.isFunction(false).should.be.false;
            _.isFunction(undefined).should.be.false;
            _.isFunction(null).should.be.false;
            _.isFunction(true).should.be.false;
            _.isFunction(NaN).should.be.false;
            _.isFunction(Function).should.be.true;
        });

        it('test _#isObject', function () {
            _.isObject("string").should.be.false;
            _.isObject("NaN").should.be.false;
            _.isObject(1).should.be.false;
            _.isObject(Infinity).should.be.false;
            _.isObject(false).should.be.false;
            _.isObject(true).should.be.false;
            _.isObject(NaN).should.be.false;
            _.isObject(Function).should.be.false;
            _.isObject(undefined).should.be.false;
            _.isObject(null).should.be.false;
            _.isObject([]).should.be.true;
            _.isObject({}).should.be.true;
        });

        it('test _#isNumber', function () {
            _.isNumber("string").should.be.false;
            _.isNumber("NaN").should.be.false;
            _.isNumber(Infinity).should.be.false;
            _.isNumber(false).should.be.false;
            _.isNumber(true).should.be.false;
            _.isNumber(NaN).should.be.false;
            _.isNumber(Function).should.be.false;
            _.isNumber(undefined).should.be.false;
            _.isNumber(null).should.be.false;
            _.isNumber([]).should.be.false;
            _.isNumber({}).should.be.false;
            _.isNumber(1).should.be.true;
        });

        it('test _#isBoolean', function () {
            _.isBoolean("string").should.be.false;
            _.isBoolean("NaN").should.be.false;
            _.isBoolean(Infinity).should.be.false;
            _.isBoolean(NaN).should.be.false;
            _.isBoolean(Function).should.be.false;
            _.isBoolean(undefined).should.be.false;
            _.isBoolean(null).should.be.false;
            _.isBoolean([]).should.be.false;
            _.isBoolean({}).should.be.false;
            _.isBoolean(1).should.be.false;
            _.isBoolean(true).should.be.true;
            _.isBoolean(false).should.be.true;
        });

        it('test _#isEmpty', function () {
            _.isEmpty([]).should.be.false;
            _.isEmpty({}).should.be.false;
            _.isEmpty(Function).should.be.false;
            _.isEmpty("string").should.be.false;
            _.isEmpty(true).should.be.false;
            _.isEmpty(false).should.be.false;

            _.isEmpty("").should.be.true;
            _.isEmpty(undefined).should.be.true;
            _.isEmpty(Infinity).should.be.true;
            _.isEmpty(NaN).should.be.true;

            _.isEmpty(null).should.be.true;
            _.isEmpty(null, false).should.be.true;
            _.isEmpty(null, true, false).should.be.true;
            _.isEmpty(null, false, true).should.be.false;
            _.isEmpty(null, true, false).should.be.true;
            _.isEmpty(null, true).should.be.false;
        });

        it('test _#isExpectedTypeOrNull', function () {
            _.isExpectedTypeOrNull("string", String).should.be.true;
            _.isExpectedTypeOrNull(0, Number).should.be.true;
            _.isExpectedTypeOrNull(Function, Function).should.be.true;
            _.isExpectedTypeOrNull([], Array).should.be.true;
            _.isExpectedTypeOrNull({}, Object).should.be.true;
            _.isExpectedTypeOrNull(true, Boolean).should.be.true;
            _.isExpectedTypeOrNull(false, Boolean).should.be.true;
            _.isExpectedTypeOrNull(null, String).should.be.true;

            _.isExpectedTypeOrNull(false, String).should.be.false;
            _.isExpectedTypeOrNull([], Function).should.be.false;
        });

        it('test _#each', function () {
            var values = ['apple', 'banana', 'dinos'];
            var count = values.length;

            _.each(values, function (val, i) {
                count--;
                values[i].should.be.eql(val);
            });

            count.should.be.eql(0);

            var obj = {key1: 'prop', 'key2': 'prop', key3: 'prop'};

            count = Object.keys(obj).length;
            _.each(obj, function (val, key) {
                count--;
                obj[key].should.be.eql(val);
            });

            count.should.be.eql(0);
        });

        it('test _#compact', function () {
            var values = [null, 1, 0, NaN, Infinity, false, true, "", "string", {}, [], undefined, Function];

            var result = _.compact(values);

            result.should.have.length(8);

            result.should.matchEach(function (it) {
                _.isEmpty(it).should.be.false;
            });

            result.should.be.eql([1, 0, false, true, "string", {}, [], Function]);
        });

        it('test _#extend', function () {
            var testObj = {prop0: 0};

            _.extend(testObj, {
                prop1: '1',
                prop2: '2'
            });

            testObj.should.be.eql({prop0: 0, prop1: '1', prop2: '2'});

            _.extend(testObj, {
                prop2: 2,
                prop3: '3'
            });

            testObj.should.be.eql({prop0: 0, prop1: '1', prop2: 2, prop3: '3'});
        });

        it('test _#format', function () {
            _.format('str ${here}', {here: 1}).should.be.eql('str 1');
            _.format('str ${here}').should.be.eql('str ${here}');
            _.format('str ${here}', {here1: 1}).should.be.eql('str ');
            _.format('str ${0}').should.be.eql('str ${0}');
            _.format('str ${0}', 1).should.be.eql('str 1');
            _.format('str ${0}-${1}', 1, 2).should.be.eql('str 1-2');
            _.format('str ${0}-${1}', [1, 2, 3]).should.be.eql('str 1-2');
            _.format('str ${0}', []).should.be.eql('str ');

        });

        after(function () {
            delete t.test;
        });

    });

    describe('test #clean functionality', function () {

        it('test #matchTraverse functionality', function () {
            var pattern = {
                name: t.rule(String),
                surname: t.rule(String),
                index: t.rule(Number),
                data: {
                    value: t.rule(Number)
                }
            };

            t.chain({
                name: 'name',
                surname: 'surname',
                index: 1,
                hidden: false
            }, pattern).build().should.be.eql({
                    name: 'name',
                    surname: 'surname',
                    index: 1,
                    data: {
                        value: undefined
                    }
                });
        });

        it('test clean functionality with Simple Root Object', function () {
            var simpleModel = {
                name: 'name',
                surname: 'surname',
                index: 1,
                hidden: false
            };

            t.chain(simpleModel, {
                name: t.rule({
                    type: String
                }),
                surname: t.rule({
                    type: String
                }),
                index: t.rule({
                    type: Number
                })
            }).build({clean: true}).should.have.keys(['name', 'surname', 'index']);
        });
        /*
        it('test #clean functionality with Array as Root Object and non object types', function () {
            var simpleModel = ['val0', {value: 2}, {}, 1, 2, null, {value: 1}, 'val1'];

            //t.clean(simpleModel, [t.rule({type: String})]).should.be.eql(['val0', 'val1']);
            t.chain(simpleModel, [t.rule({type: String})]).build({clean: true})
                .should
                .be
                .matchEach(['val0', 'val1']);
        });

        it('test #clean functionality with Array as Root Object and object types', function () {
            var simpleModel = ['val0', {value: 2}, {}, 1, 2, null, {value: 1}];

            //t.clean(simpleModel, [{value: t.rule({type: Number})}]).should.be.eql([null, {value: 2}, null, null, null, null, {value: 1}]);
            t.chain(simpleModel, [{value: t.rule({type: Number})}]).build({clean: true}).should.be.eql([null, {value: 2}, null, null, null, null, {value: 1}]);
        });
        */
        it('test #clean functionality with Object as Root and Complex data in nodes', function () {
            var complexModel = {
                data: {
                    data: {
                        data: [{
                            value: [{
                                data: 1
                            }, {
                                data: 2
                            }, {
                                abracadbra: 2
                            }]
                        }, {
                            value: [{
                                data: 4
                            }]
                        }, {
                            jalouse: []
                        }]
                    }
                }
            };

            t.chain(complexModel, {
                data: {
                    data: {
                        data: [{
                            value: [{
                                data: t.rule(Number)
                            }]
                        }]
                    }
                }
            }).build({clean: true}).should.be.eql({
                    data: {
                        data: {
                            data: [{
                                value: [{
                                    data: 1
                                }, {
                                    data: 2
                                }]
                            }, {
                                value: [{
                                    data: 4
                                }]
                            }]
                        }
                    }
                });
        });

        //Add more detailed tests
        it('test separate build', function () {
            var nodes = t.matchTraverse({name: 'Illusion', when: 'Come on'}, {name: t.vertex()});
            t.build(nodes, {clean: true}).should.be.eql({name: 'Illusion'});
        });
    });
});