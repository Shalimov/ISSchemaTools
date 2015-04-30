var t = require('../src/isschema-tools');

//TODO: added test to register validation, to URL/Digit rules, and etc
describe('test validation module functionality', function () {
    it('test existence of functions of module', function () {
        t.validation.should.have.keys(['validate', 'register', 'messages']);
        t.validation.validate.should.be.a.Function;
        t.validation.register.should.be.a.Function;
        t.validation.messages.should.be.a.Function;
    });

    it('test existence of functions of chain', function () {
        var chain = t.chain({name: 'String'}, {name: t.rule({type: String})});
        chain.should.have.property('validate');
        chain.validate.should.be.a.Function;
    });

    it('test required validator', function () {
        var pattern = {
            name: t.rule({
                type: String,
                validation: {
                    required: true
                }
            })
        };

        var messages = t.chain({name: null}, pattern).validate();
        messages.should.be.eql(['name is required']);

        messages = t.chain({name: ""}, pattern).validate();
        messages.should.be.eql(['name is required']);

        messages = t.chain({name: undefined}, pattern).validate();
        messages.should.be.eql(['name is required']);

        messages = t.chain({name: NaN}, pattern).validate();
        messages.should.be.eql(['name is required']);

        messages = t.chain({name: false}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test type validator', function () {
        var pattern = {
            name: t.rule({
                type: String,
                validation: {
                    type: true
                }
            })
        };

        messages = t.chain({name: 1}, pattern).validate();
        messages.should.be.eql(['name must have appropriate type']);

        messages = t.chain({name: ''}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({name: 'numeric'}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test email validator', function () {
        var pattern = {
            email: t.rule({
                type: String,
                validation: {
                    email: true
                }
            })
        };

        var messages = t.chain({email: '1'}, pattern).validate();
        messages.should.be.eql(['email must be correct']);

        messages = t.chain({email: 'numeric'}, pattern).validate();
        messages.should.be.eql(['email must be correct']);

        messages = t.chain({email: 1}, pattern).validate();
        messages.should.be.eql(['email must be correct']);

        //Empty values ignores
        messages = t.chain({email: undefined}, pattern).validate();
        (messages === null).should.be.true;

        //Empty values ignores
        messages = t.chain({email: NaN}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({email: 'ShaLimich@mail.net'}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test minLength validator', function () {
        var pattern = {
            email: t.rule({
                type: String,
                validation: {
                    minLength: 5
                }
            })
        };

        var messages = t.chain({email: '1'}, pattern).validate();
        messages.should.be.eql(['email must have length at least 5']);

        messages = t.chain({email: 1}, pattern).validate();
        messages.should.be.eql(['email must have length at least 5']);

        messages = t.chain({email: 'numa'}, pattern).validate();
        messages.should.be.eql(['email must have length at least 5']);

        //Empty values ignores
        messages = t.chain({email: undefined}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({email: 'numa1'}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test maxLength validator', function () {
        var pattern = {
            email: t.rule({
                type: String,
                validation: {
                    maxLength: 5
                }
            })
        };

        var messages = t.chain({email: '11233213321'}, pattern).validate();
        messages.should.be.eql(['email must have length at most 5']);

        messages = t.chain({email: '32133211'}, pattern).validate();
        messages.should.be.eql(['email must have length at most 5']);

        messages = t.chain({email: 'numafds'}, pattern).validate();
        messages.should.be.eql(['email must have length at most 5']);

        //Empty values ignores
        messages = t.chain({email: undefined}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({email: 'numa1'}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test eqlLength validator', function () {
        var pattern = {
            email: t.rule({
                type: String,
                validation: {
                    eqlLength: 5
                }
            })
        };

        var messages = t.chain({email: '11233213321'}, pattern).validate();
        messages.should.be.eql(['email must have length eql 5']);

        messages = t.chain({email: '32133211'}, pattern).validate();
        messages.should.be.eql(['email must have length eql 5']);

        messages = t.chain({email: 'numafds'}, pattern).validate();
        messages.should.be.eql(['email must have length eql 5']);

        //Empty values ignores
        messages = t.chain({email: undefined}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({email: 'numa1'}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test eqlLength validator', function () {
        var pattern = {
            email: t.rule({
                type: String,
                validation: {
                    range: [2, 5]
                }
            })
        };

        var messages = t.chain({email: 3}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({email: 4}, pattern).validate();
        (messages === null).should.be.true;

        //Empty value gives true
        messages = t.chain({email: undefined}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({email: '4'}, pattern).validate();
        (messages === null).should.be.false;

        messages = t.chain({email: 5}, pattern).validate();
        (messages === null).should.be.false;

        messages = t.chain({email: 2}, pattern).validate();
        (messages === null).should.be.false;
    });

    it('test equalTo validator', function () {
        var pattern = {
            email: t.rule({
                type: String
            }),
            confirm: t.rule({
                type: String,
                validation: {
                    equalTo: 'email'
                }
            })
        };

        var messages = t.chain({email: 3, confirm: 4}, pattern).validate();
        (messages === null).should.be.false;

        messages = t.chain({email: 'string', confirm: 'ds'}, pattern).validate();
        (messages === null).should.be.false;

        messages = t.chain({email: 3, confirm: 3}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({email: 'string', confirm: 'string'}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test equalTo validator injector', function () {
        var model = {
            cards: [
                {
                    type: 'CRC',
                    number: 'CRC'
                },
                {
                    type: 'BKB',
                    number: 'BKB'
                },
                {
                    type: 'JOIN',
                    number: 'JOIN'
                }
            ]
        };

        var pattern = {
            cards: [
                {
                    type: t.rule(String),
                    number: t.rule({
                        type: String,
                        validation: {
                            equalTo: '@s.type'
                        }
                    })
                }
            ]
        };

        var messages = t.chain(model, pattern).validate();
        (messages === null).should.be.true;

        model = {
            cards: [
                {
                    type: {value: 'CRC'},
                    number: 'CRC'
                },
                {
                    type: {value: 'BKB'},
                    number: 'BKB'
                },
                {
                    type: {value: 'JOIN'},
                    number: 'JOIN'
                }
            ]
        };

        pattern = {
            cards: [
                {
                    type: {
                        value: t.rule(String)
                    },
                    number: t.rule({
                        type: String,
                        validation: {
                            equalTo: '@s.type.value'
                        }
                    })
                }
            ]
        };

        messages = t.chain(model, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test belongsTo validator', function () {
        var pattern = {
            sex: t.rule({
                type: String,
                validation: {
                    belongsTo: ['man', 'woman']
                }
            })
        };

        var messages = t.chain({sex: 3}, pattern).validate();
        (messages === null).should.be.false;

        messages = t.chain({sex: 'volodya'}, pattern).validate();
        (messages === null).should.be.false;

        messages = t.chain({sex: 'man'}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({sex: 'woman'}, pattern).validate();
        (messages === null).should.be.true;
    });

    it('test regex validator', function () {
        var pattern = {
            sex: t.rule({
                type: String,
                validation: {
                    regex: /^test$/i
                }
            })
        };

        var messages = t.chain({sex: 'test'}, pattern).validate();
        (messages === null).should.be.true;

        messages = t.chain({sex: 'atesta'}, pattern).validate();
        (messages === null).should.be.false;
    });
});