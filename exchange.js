
var lastMessageAuthorSelector = 'span.im_message_author_wrap a';
var lastMessageTextSelector = 'div.im_message_text';
var link = 'a';

var _30sec = 30*1000;

function sleep(ms, isLog) {
    if(isLog) {
        var time = ms / 1000 > 60 ? (ms / (60 * 1000)) + " minutes" : (ms / 1000) + " seconds";
        var current = new Date();
        var currentTime = current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds();
        log(currentTime + '    going to sleep for ' + time);
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log() {
    if(isLog){
        console.error.apply(null, arguments);
    }
}

var isLog = true;
var work = true;

async function main() {
    console.error('exchange monitor starting');

    var base = $(lastMessageAuthorSelector).last().parent().parent().parent();
    var text = base.find(lastMessageTextSelector);
    var a = text.find(link);
    
    while (work) {

        try {
            for (var i = 0; i < a.length; i++) {
            	a[i].click();
            	await sleep(_30sec, true);
            }
            await sleep(_30sec, true);
        } catch(err) {
            console.error(err.message);
            await sleep(_30sec, true);

        }
    }

}



main();