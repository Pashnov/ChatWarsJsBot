

var baseMessagesViaChatWarsTradeBotSelector = 'span.im_message_fwd_author';
var lastMessageTextSelector = 'div.im_message_text';



var _1sec =     1000;
var _2sec =     2000;
var _3sec =   3*1000;
var _5sec =   5*1000;
var _10sec = 10*1000;
var _20sec = 20*1000;
var _30sec = 30*1000;

var redFlag = '🇮🇲';
var blackFlag = '🇬🇵';
var blueFlag = '🇪🇺';
var whiteFlag = '🇨🇾';
var yellowFlag = '🇻🇦';


// constants

var isLog = true;

function sleep(ms, isLog) {
    if(isLog) {
        var time = ms / 1000 > 60 ? (ms / (60 * 1000)) + " minutes" : (ms / 1000) + " seconds";
        var current = new Date();
        var currentTime = current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds();
        log(currentTime + '    going to sleep for ' + time);
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}



function log(msg) {
    if(isLog){
        console.error(msg);
    }
}

var pattern = new RegExp('(^[\\w\\s]+воин (.{2,4})) предлагает:[\\S\\s]+(^[\\w\\s]+воин (.{2,4})) предлагает:[\\S\\s]+', 'um');


var globalIndex = 0;
var size = 20;
var namePool = new Array(size);

function isUserLogged(f) {
    if(contains(f)){
        return true;
    } else {
        var index = globalIndex % size;
        namePool[index] = f;
        return false;
    }
}

function contains(str) {
    for(var i = 0; i < namePool.length; i++){
        if(str == namePool[i]){
            return true;
        }
    }
    return false;
}

function process(t) {
    var result = {};
    result.status = false;
    try {
        var re = pattern.exec(t);
        var first = re[1];
        var firstFlag = re[2];
        var second = re[3];
        var secondFlag = re[4];
        if(firstFlag == secondFlag){
            return result;
        }
        result.first = first;
        result.firstFlag = firstFlag;
        result.second = second;
        result.secondFlag = secondFlag;
        result.status = true;
        return result;
    } catch (err){
        // log("msg = " + t);
        // log(err.message);
        return result;
    }

}

function isDoneDeal(textListElem) {
    return $(textListElem).parent().find('div.im_message_keyboard[style="display: none;"]').length > 0;
}

var work = true;

async function main() {
    log('Emulating starting');

    mainLoop:
    while (work) {

        try {
            var list = $(baseMessagesViaChatWarsTradeBotSelector).parent().parent().parent().parent().parent();
            var textList = list.find(lastMessageTextSelector);
            // textList[0].innerText;
            for(var i = textList.length - 1; i >= 0; i--){
                var msgText = textList[i].innerText;

                var result = process(msgText);
                // log("status = " + result.status);
                // log("msgText = " + msgText);
                if(result.status){
                    var isDone = isDoneDeal(textList[i]);
                    // log("isDone = " + isDone);
                    if(isDone){
                        var isLogged = isUserLogged(result.first);
                        // log("isLogged = " + isLogged);
                        if(!isLogged) {
                            log("#########################################");
                            log(result.first);
                            log(result.second);
                            log("  ");
                            log(msgText);
                        }
                    }
                }
            }
            //################################################################################
            await sleep(_5sec, false);
            //################################################################################

        } catch(err) {
            console.error(err.message);
            await sleep(_3sec, true);

        }

    }

}

main(/*minutes to fight*/);