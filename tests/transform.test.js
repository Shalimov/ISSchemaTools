var t = require('../src/isschema-tools');


//add test for transformer -> default
//add test for toType transformer,
//add test to toString transformer
//add test to register and build
describe('test transformers module functionality', function () {
    it('test existence of functions of module', function () {
        t.transform.should.have.keys(['transform', 'register', 'build', 'transformers']);
        t.transform.transform.should.be.a.Function;
        t.transform.register.should.be.a.Function;
        t.transform.build.should.be.a.Function;
        t.transform.transformers.should.be.a.Object;
    });

    it('test existence of functions of chain', function () {
        var chain = t.chain({name: 'String'}, {name: t.rule({type: String})});
        chain.should.have.property('transform');
        chain.transform.should.be.a.Function;
    });

    it('test transform methods #trim, #trimRight, #trimLeft', function () {
        var tr = t.transform.transformers;
        var model = {
            name: ' good skills '
        };

        t.chain(model, {
            name: t.rule({
                type: String,
                transform: [tr.trim]
            })
        }).transform().build().should.be.eql({name: 'good skills'});

        t.chain(model, {
            name: t.rule({
                type: String,
                transform: [tr.trimLeft, tr.trimRight]
            })
        }).transform().build().should.be.eql({name: 'good skills'});
    });

    it('test transform methods #substring', function () {
        var tr = t.transform.transformers;
        var model = {
            name: 'good skills'
        };

        t.chain(model, {
            name: t.rule({
                type: String,
                transform: [tr.substring([0, 4])]
            })
        }).transform().build().should.be.eql({name: 'good'});

        t.chain(model, {
            name: t.rule({
                type: String,
                transform: [tr.substring([5])]
            })
        }).transform().build().should.be.eql({name: 'skills'});
    });

    it('test transform methods #substring', function () {
        var tr = t.transform.transformers;
        var model = {
            name: 'good skills'
        };

        t.chain(model, {
            name: t.rule({
                type: String,
                transform: [tr.replace([/\s/g, '-']), tr.substring([3, 6])]
            })
        }).transform().build().should.be.eql({name: 'd-s'});
    });

    it('test transform methods #toUpper, #toLower', function () {
        var tr = t.transform.transformers;

        t.chain({
            name: 'good skills'
        }, {
            name: t.rule({
                type: String,
                transform: [tr.toUpper]
            })
        }).transform().build().should.be.eql({name: 'GOOD SKILLS'});

        t.chain({
            name: 'GOOD SKILLS'
        }, {
            name: t.rule({
                type: String,
                transform: [tr.toLower]
            })
        }).transform().build().should.be.eql({name: 'good skills'});
    });

    it('test transform methods #nullIfEmpty', function () {
        var tr = t.transform.transformers;

        t.chain({
            name: 'String',
            surname: '',
            age: NaN
        }, {
            name: t.rule({
                type: String
            }),
            surname: t.rule({
                type: String,
                transform: [tr.nullIfEmpty]
            }),
            age: t.rule({
                type: Number,
                transform: [tr.nullIfEmpty]
            })
        }).transform().build().should.be.eql({name: 'String', surname: null, age: null});
    });
});