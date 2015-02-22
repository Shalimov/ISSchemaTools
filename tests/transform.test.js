var t = require('../src/isschema-tools');

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
                transformers: [tr.trim]
            })
        }).clean().transform().build().should.be.eql({name: 'good skills'});

        t.chain(model, {
            name: t.rule({
                type: String,
                transformers: [tr.trimLeft, tr.trimRight]
            })
        }).clean().transform().build().should.be.eql({name: 'good skills'});
    });

    it('test transform methods #substring', function () {
        var tr = t.transform.transformers;
        var model = {
            name: 'good skills'
        };

        t.chain(model, {
            name: t.rule({
                type: String,
                transformers: [tr.substring([0, 4])]
            })
        }).clean().transform().build().should.be.eql({name: 'good'});

        t.chain(model, {
            name: t.rule({
                type: String,
                transformers: [tr.substring([5])]
            })
        }).clean().transform().build().should.be.eql({name: 'skills'});
    });

    it('test transform methods #substring', function () {
        var tr = t.transform.transformers;
        var model = {
            name: 'good skills'
        };

        t.chain(model, {
            name: t.rule({
                type: String,
                transformers: [tr.replace([/\s/g, '-']), tr.substring([3, 6])]
            })
        }).clean().transform().build().should.be.eql({name: 'd-s'});
    });

    it('test transform methods #toUpper, #toLower', function () {
        var tr = t.transform.transformers;

        t.chain({
            name: 'good skills'
        }, {
            name: t.rule({
                type: String,
                transformers: [tr.toUpper]
            })
        }).clean().transform().build().should.be.eql({name: 'GOOD SKILLS'});

        t.chain({
            name: 'GOOD SKILLS'
        }, {
            name: t.rule({
                type: String,
                transformers: [tr.toLower]
            })
        }).clean().transform().build().should.be.eql({name: 'good skills'});
    });


    it('test transform methods #toString', function () {
        var tr = t.transform.transformers;

        t.chain({
            name: 1
        }, {
            name: t.rule({
                type: Number,
                transformers: [tr.toStringType]
            })
        }).clean().transform().build().should.be.eql({name: "1"});

        t.chain({
            name: [1, 2, 3, 4, 5]
        }, {
            name: t.rule({
                type: Array,
                transformers: [tr.toStringType]
            })
        }).clean().transform().build().should.be.eql({name: '1,2,3,4,5'});
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
                transformers: [tr.nullIfEmpty]
            }),
            age: t.rule({
                type: Number,
                transformers: [tr.nullIfEmpty]
            })
        }).transform().build().should.be.eql({name: 'String', surname: null, age: null});
    });
});