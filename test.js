
var until = require('./until.js'),
    assert = require('assert');


/**
 * this function should never be called
 */
function failFunction() {
    assert.fail('', '', 'this callback should not be called');
}



describe('until.js', function() {


    /* SIMPLE COUNT INTERFACE */
    describe('#count()', function() {
        
        it('preconditions: require a parameter', function() {
            assert.throws(
                function() { until(); },
                /missing parameter/
            );
        });
                
        it('preconditions: parameter must be a positive integer', function() {

            assert.throws(
                function() { until("ABC"); },
                /parameter must be a positive integer/
            );
            
            assert.throws(
                function() { until(-1); },
                /parameter must be a positive integer/
            );

        });
        

        it('preconditions: it should reject non-number parameters', function() {
            var collect = until(1, failFunction);
            
            assert.throws(
                function() { collect('ABC'); },
                /parameter must be a positive integer/
            );
        });
         

        it('should call done after 1 calls', function(done) {
            var collect = until(1, done);
            collect(); // 1, done is called
        });

        it('should call done after 2 calls', function(done) {
            var collect = until(2, done);
            collect(); // 1
            collect(); // 2, done is called
        });

        it('should call done after 3 calls', function(done) {
            var collect = until(3, done);
            collect(); // 1
            collect(); // 2
            collect(); // 3, done is called
        });


        it('should call done after 3 calls at once', function(done) {
            var collect = until(3, done);
            collect(3); // 1, 2, 3, done is called
        });


        it('should not allow to exceed the count', function() {
            var collect = until(2, failFunction);
            assert.throws(
                function() {
                    collect(3); // 1, 2, 3 > 2, error is thrown
                },
                /count exceeded/
            );
        });
    });
    
    

    /* ARRAY INTERFACE */


    describe('#array()', function(){
        
        it('preconditions : check valid arguments', function() {

            assert.throws(
                function() {
                    until([-1]); // not a string
                },
                /values in array must be strings/
            );


            assert.throws(
                function() {
                    until(["first", "second", "third", -1]); // contains not a string
                },
                /values in array must be strings/
            );
        });
        

        it('should accept a string', function(done) {
            var collect = until(['first'], done);
            collect('first');
        });

        it('should accept String ojects', function(done) {
            var collect = until([new String('first')], done);
            collect('first');
        });


        it('should accept a mix of string and String ojects', function(done) {
            var collect = until([new String('first'), 'second', 'third', new String('last')], done);
            collect('first');
            collect('second');
            collect('last');
            collect('third');
        });

        it('should reject strings not in the array', function() {
            var collect = until(
                [
                    new String('first'),
                    'second',
                    'third',
                    new String('last')
                ],
                failFunction);

            collect('first');
            collect('second');

            assert.throws(
                function() {
                    collect('a key that doesnt exist');
                },
                /not in original array/
            );

            collect('third');
        });

      });


    /* OBJECT INTERFACE */
    describe('#object()', function() {
        it('should accept a hashmap with string keys and positive integer values', function() {

            assert.throws(
                function() {
                    until({'first' : 'notAnumber'}, failFunction);
                },
                /parameter must be a positive integer/
            );


            assert.throws(
                function() {
                    until({'first' : 1, 'second' : -5}, failFunction);
                },
                /parameter must be a positive integer/
            );
            
        });


        it('should detect too many calls', function() {
            var collect = until({'first' : 3, 'second' : 2, 'third' : 1}, failFunction);
            
            collect('first');  // first : 2 left
            collect('first');  // first : 1 left
            collect('first');  // first : 0 left
            collect('second'); // second : 1 left
            collect('second'); // second : 0 left

            assert.throws(
                function() {
                    collect('second'); // second : -1 left ?
                },
                /called too many times/
            );

        });


        it('should reject unknown keys', function() {
            var collect = until({'first' : 1, 'second' : 1, 'third' : 1}, failFunction);
            
            collect('first');
            collect('second');

            assert.throws(
                function() { collect('unknownKey'); },
                /not in original object/
            );
        });



        it('should accept an object', function(done) {
            var collect = until({'first' : 1, 'second' : 1, 'third' : 1}, done);
            
            collect('first');
            collect('second');
            collect('third');
        });

    });

    
});


