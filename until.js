
/**
 * Until.js / collect.js ?
 * @author Nicolas Ha
 *
 */



function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isStrOrStrObject(str) {
    return (typeof str === 'string') || (str instanceof String);
}

function waitForCount(count, realCallback){
    var nbDone = 0;

    if(count <= 0) {
        throw new Error("parameter must be a positive integer", count);
    }

    return function(add) {
        if(! add) {
            nbDone++;
        } else if (isNumber(add)){
            nbDone += add;
            if(nbDone > count) {
                throw new Error("count exceeded");
            }
        } else {
            throw new Error("parameter must be a positive integer");
        }

        if(count === nbDone) {
           process.nextTick(function(){ realCallback(); });
        }
    };
};



function waitForArray(arrayToComplete, realCallback) {
    var nbDone = 0
        completed = {} ;


    if(arrayToComplete.length === 0) {
        process.nextTick(function(){realCallback});
    }
    
    completed = arrayToComplete.reduce(function(acc, str) {
        if(! isStrOrStrObject(str)) {
            throw new Error('values in array must be strings');
        }
        acc[str] = false ;
        return acc;
    }, {});

    return function(justCompleted) {

        if(completed[justCompleted] === false) {
            // normal case
            completed[justCompleted] = true;
            nbDone++;
        } else if(completed[justCompleted] === true) {
            throw new Error("already called", justCompleted);
        } else {
            throw new Error("not in original array", justCompleted);
        }
        
        if(arrayToComplete.length === nbDone) {
            process.nextTick(function(){ realCallback(); });
        }
    };
}


function waitForObject(toCompleteParam, realCallback) {
    var nbDone = 0,
        nbTodo = 0,
        toComplete = {};
    
    // clone objToComplete 
    for (var attr in toCompleteParam) {
        if (toCompleteParam.hasOwnProperty(attr)) {
            if( (! isNumber(toCompleteParam[attr])) || (toCompleteParam[attr] < 0) ) {
                throw new Error("parameter must be a positive integer");
            }
            toComplete[attr] = toCompleteParam[attr];
            nbTodo += toCompleteParam[attr];
        }
    }

    return function(justCompleted) {
        var count = toComplete[justCompleted];
        if(! count && count !== 0) {
            throw new Error("not in original object");
        }

        toComplete[justCompleted] = --count;
        nbDone++;

        if(count < 0) {
            throw new Error("called too many times");
        }

        if(nbTodo === nbDone) {
            process.nextTick(function(){ realCallback(); });
        }
    };
}

module.exports = function(param, realCallback) {

    if(! param) {
        throw new Error("missing parameter");
    } else if(param instanceof Array) {
        return waitForArray(param, realCallback);
    } else if (isNumber(param)) {
        return waitForCount(param, realCallback);
    } else {
        return waitForObject(param, realCallback);
    }
};
