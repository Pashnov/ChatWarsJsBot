// 0.0.1 - initial
// 0.0.2 - added more logs and improvements before fight
// 0.0.3 - added new Date and clever the only sleep
// 0.0.4 - added another check for fight state instead button 'defense'(🛡 Защита),
//         added clever waiter between fight actions, added sleep for 8 minutes, if there isn't fight
// 0.0.5 - added quantity restriction for click 'Поиск сопрника', add isBigFightTime and correct behaviour when it is
//         added new more clever check before click buttons during fight, decrease timeout between atc and def during fight

var box_buttons_css_selector = '.reply_markup_wrap > div > div > div > div.reply_markup';
var btnSelector = 'div.reply_markup_button_wrap > button.reply_markup_button';

var lastMessageAuthorSelector = 'span.im_message_author_wrap a:contains("Chat Wars")';
var lastMessageTimeSelector = 'span.im_message_date_text'; // attr data-content
var lastMessageTextSelector = 'div.im_message_text';
var lastMessageTextMustntBeCounted = 'Хороший план, посмотрим что из этого выйдет.';
var lastMessageTextMustntBeCounted1 = 'Слишком долго! Выбор сделан автоматически. ¯\\_(ツ)_/¯';
var lastPartNot_1 = 'Слишком долго';
var lastPartNot_2 = 'тычет копьем';
var goodQuestResponse = 'Ты отправился искать приключения в лес. Вернешься через 5 минут.';
var goodQuestResponseShort = 'Ты отправился';
var lowStamina = 'Слишком мало единиц выносливости';

var textDefence = '🛡 Защита';
var textRedFlag = '🇮🇲';
var textCastle = ':european_castle:Замок';
var textArena = ':postal_horn:Арена';
var textSearchingOpponent = ':mag_right:Поиск соперника';
var textCancelSearching = ':heavy_multiplication_x:Отменить поиск';
var textBack = ':arrow_left:Назад';
var textQuests = '🗺 Квесты';
var textForest = ':evergreen_tree:Лес';
var textCave = '🕸Пещера';

var btnsAtcDef = ['🗡в голову', '🗡по ногам', '🗡по ногам', '🛡головы', '🛡корпуса', '🛡ног'];
var quests = [textForest, textCave, textForest];

var _1sec =        1000;
var _2sec =        2000;
var _3sec =      3*1000;
var _5sec =      5*1000;
var _10sec =    10*1000;
var _20sec =    20*1000;
var _30sec =    30*1000;
var _1min  =  1*60*1000;
var _2min  =  2*60*1000;
var _5min  =  5*60*1000;
var _9min  =  9*60*1000;
var _1hour = 60*60*1000;

// constants
var iterationFightRestriction = 100;
var iterationSearchOpponentRestriction = 7;

var hours =  [0, 4, 8, 12, 16, 20];

var minuteBefore = 10;
var minuteAfter = 6;

var questStatus = {_0:false,_4:false,_8:false,_12:false,_16:false,_20:false};

var isLog = false;
var ally = '🇪🇺' ; // if don't have ally -> ally = undefined

function getRandomButton(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

async function sleep(ms, isLog) {
    if(isLog) {
        var time = ms / 1000 > 60 ? (ms / (60 * 1000)) + " minutes" : (ms / 1000) + " seconds";
        var current = new Date();
        var currentTime = current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds();
        log(currentTime + '    going to sleep for ' + time);
    }
    if(ms > _2min){
        var iterationAmount = ms/_1min;
        var remainder = ms%_1min;
        for(var i = 0; i < iterationAmount; i++){
            checkGoAndAct();
            await sleepInner(_1min);
        }
        await sleepInner(remainder);
    } else {
        await sleepInner(ms);
    }
}

function sleepInner(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkGoAndAct() {
    var base = $(lastMessageAuthorSelector).last().parent().parent().parent();
    var text = base.find(lastMessageTextSelector);
    var textMsg = text[0].innerText;
    if(ally && textMsg.includes(ally)){
        // do nothing
    } else {
        var a = text.find('a');
        if(a.length > 0) {
            a[0].click();
        }
    }
}

function findBtnByText(arr, text){
    for(var i = 0; i < arr.length; i++){
        if(arr[i].innerText == text){
            return arr[i];
        }
    }
    return false;
}

function isFight(arr) {
    // log('called #isFight');
    var result = isFightInner(arr);
    // if(!result){
    //     log('called #isFight = ' + result);
    //     for(var i = 0; i < arr.length; i++){
    //         log('btns[' + i + '] = ' + arr[i].innerText );
    //     }
    // }
    return result;
}

function isFightInner(arr) {
    for(var i = 0; i < arr.length; i++){
        for(var j = 0; j < btnsAtcDef.length; j++) {
            if (arr[i].innerText == btnsAtcDef[j]) {
                return true;
            }
        }
    }
    return false;
}

function isBigFightTime() {
    var current = new Date();
    var hour = Number(current.getHours());
    var minute = Number(current.getMinutes());
    for(var i = 0; i < hours.length; i++){
        if(hours[i] == hour){
            if(minute <= minuteAfter){
                return true;
            }
        } else if ( (hours[i] - 1) == hour){
            if (minute >= (60 - minuteBefore)){
                return true;
            }
        }
    }
    return false;
}

function getTimeToNexBigFight() {
    var current = new Date();
    var hour = Number(current.getHours());
    var minute = Number(current.getMinutes());
    if(hour >= 8){
        return _1hour;
    }
    for(var i = 0; (i < hours.length - 1); i++){
        if(hour >= hours[i] && hours[i+1] > hour){
            var difHour = hours[i+1] - hour - 1;
            var difMinute = 56 - minute;
            return (difHour * 60 + difMinute ) * 60 * 1000;
        }
    }
    if(hour >= 20){
        var difHour = 24 - hour - 1;
        var difMinute = 56 - minute;
        return (difHour * 60 + difMinute ) * 60 * 1000;
    }
    return _30sec;
}

function isArenaWorking() {
    var current = new Date();
    var hour = Number(current.getHours());
    // var minute = current.getMinutes();
    return hour >= 9;
}

function getSleepTimeDuringBigFight() {
    var currentMinute = Number(new Date().getMinutes());
    if(currentMinute > 50){
        return ((60 - currentMinute) + minuteAfter ) * 60 * 1000;
    } else {
        return (minuteAfter - currentMinute) * 60 * 1000;
    }
}

function clickBtn(btn) {
    angular.element(btn).triggerHandler('click');
}

function getTimeLastChatWarsMsg() {
    var base = $(lastMessageAuthorSelector).last().parent().parent().parent();
    var text = base.find(lastMessageTextSelector)[0].innerText;
    var pre = -2;
    // while(text == lastMessageTextMustntBeCounted || text == lastMessageTextMustntBeCounted1){
    while(text == lastMessageTextMustntBeCounted || text.includes(lastPartNot_1) || text.includes(lastPartNot_2)){
        base = $(lastMessageAuthorSelector).eq(pre).parent().parent().parent(); // prelast
        pre--;
        text = base.find(lastMessageTextSelector)[0].innerText;
    }
    return base.find(lastMessageTimeSelector)[0].getAttribute('data-content');
}

function isReachedLimitArena() {
    var base = $(lastMessageAuthorSelector).last().parent().parent().parent();
    var text = base.find(lastMessageTextSelector)[0].innerText;
    var re = new RegExp('Поединков сегодня (\\d+) из (\\d+)');
    var res = re.exec(text);
    return !(Number(res[1]) < Number(res[2]));
}

function isWarningAboutNotEnoughMoneyForArena() {
    var notEnoughMoney = 'У тебя нет 5:moneybag:, чтобы оплатить заявку на поединок.';
    var base = $(lastMessageAuthorSelector).last().parent().parent().parent();
    var text = base.find(lastMessageTextSelector)[0].innerText;
    return text == notEnoughMoney;
}

function log() {
    if(isLog){
        console.error.apply(null, arguments);
    }
}

function getCurrentButtons() {
    return $(box_buttons_css_selector).find(btnSelector);
}

function checkAndClickBtn(btn, text) {
    if (btn) {
        clickBtn(btn);
        log('Clicked ' + text);
    } else {
        log(text + ' isn\'t found');
    }
}

function getQuestStatus() {
    var current = new Date();
    var hour = current.getHours();
    if(hour >= 20){
        if(!questStatus._20){
            return false;
            questStatus._20 = true;
        } else {
            return true;
        }
    } else if(hour >= 16){
        if(!questStatus._16){
            return false;
            questStatus._16 = true;
        } else {
            return true;
        }
    } else if(hour >= 12){
        if(!questStatus._12){
            return false;
            questStatus._12 = true;
        } else {
            return true;
        }
    } else if(hour >= 8){
        if(!questStatus._8){
            return false;
            questStatus._8 = true;
        } else {
            return true;
        }
    } else if(hour >= 4){
        if(!questStatus._4){
            return false;
            questStatus._4 = true;
        } else {
            return true;
        }
    } else if(hour >= 0){
        if(questStatus._20  || questStatus._16 || questStatus._12 || questStatus._8 || questStatus._4){
            questStatus._0 = false;
            questStatus._4 = false;
            questStatus._8 = false;
            questStatus._12 = false;
            questStatus._16 = false;
            questStatus._20 = false;
        }
        if(!questStatus._0){
            return false;
        } else {
            questStatus._0 = true;
            return true;
        }
    }
}

function getLastChatWarsMsg() {
    var base = $(lastMessageAuthorSelector).last().parent().parent().parent();
    var text = base.find(lastMessageTextSelector)[0].innerText;
    return text;
}

var work = true;

async function main(toNextFight) {
    console.error('Emulating starting');
    var timeLastFight = undefined;


    mainLoop:
    while (work) {

        try {

            //goDef
            var cleverDelay = timeLastFight == undefined
                ? (toNextFight == undefined ? _20sec : (toNextFight * 60 * 1000 - (5 * _20sec) ))
                : timeLastFight + (60*60*1000) - (5 * _20sec) - (new Date().getTime());

            await sleep(cleverDelay, true);

            log('going to def');
            var btnDefence = findBtnByText(getCurrentButtons(), textDefence);
            checkAndClickBtn(btnDefence, 'def button');
            await sleep(_20sec, true);

            log('going to click red flag');

            var btnRedFlag = findBtnByText(getCurrentButtons(), textRedFlag);
            checkAndClickBtn(btnRedFlag, 'red flag');
            await sleep(_20sec, true);
            //################################################################################

            if(!isArenaWorking()){
                var timeToNextBigFight = getTimeToNexBigFight();
                if(timeToNextBigFight < _2min){
                    var time = getSleepTimeDuringBigFight();
                    await sleep(time, true);
                }
                //todo:: the first cut in point
                var wasQuest = getQuestStatus();
                if(!wasQuest){ // ### quest))) ###
                    // #1 forest, #2 cave, #3 again forest
                    for(var q = 0; q < quests.length; q++){
                        var btnQuests = findBtnByText(getCurrentButtons(), textQuests);
                        checkAndClickBtn(btnQuests, 'quests button');
                        await sleep(_20sec, true);

                        var btnQuest = findBtnByText(getCurrentButtons(), quests[q]);
                        checkAndClickBtn(btnQuest, 'quest['+ quests[q]+'] button');
                        await sleep(_20sec, true);
                        var lastMsg = getLastChatWarsMsg();
                        if(lastMsg == goodQuestResponse){
                            // everything is right, went in forest
                        } else if(lastMsg == lowStamina) {
                            q = quests.length;
                            continue;
                        } else {
                            // must resolve captcha
                            var btnCaptchaText = solveCaptcha(lastMsg);
                            if (btnCaptchaText){
                                // able to resolve captcha
                                var btnCaptcha = findBtnByText(getCurrentButtons(), btnCaptchaText);
                                checkAndClickBtn(btnCaptcha, 'captcha['+ btnCaptchaText +'] button');
                                await sleep(_20sec, true);
                                lastMsg = getLastChatWarsMsg();
                                // while (lastMsg != goodQuestResponse){
                                while (!lastMsg.includes(goodQuestResponseShort)){
                                    await sleep(_2min, true);
                                    lastMsg = getLastChatWarsMsg();
                                }
                            }
                        }
                        await sleep(_9min, true);
                    }

                }
                timeToNextBigFight = getTimeToNexBigFight();
                await sleep(timeToNextBigFight, true);
                continue mainLoop;
            }

            //goToArena
            if(isBigFightTime()){ // global check before going to arena
                log('big fight is about to start. Time to sleep');
                var time = getSleepTimeDuringBigFight();
                await sleep(time, true);
            }

            log('going to go to castle');
            var btnCastle = findBtnByText(getCurrentButtons(), textCastle);
            checkAndClickBtn(btnCastle, 'castle');
            await sleep(_20sec, true);

            log('going to go to Arena');
            var btnArena = findBtnByText(getCurrentButtons(), textArena);
            checkAndClickBtn(btnArena, 'arena');
            await sleep(_20sec, true);

            //##############################################################
            if(isReachedLimitArena()){
                console.log('isReachedLimitArena');
                //click back

                var btnBack_ = findBtnByText(getCurrentButtons(), textBack);
                checkAndClickBtn(btnBack_, 'back button');
                var timeToNextBigFight = getTimeToNexBigFight();
                await sleep(timeToNextBigFight, true);
                continue mainLoop;
            }
            
            //##############################################################

            //searchingOpponent
            log('going to search opponent');

            var btnOpponent = findBtnByText(getCurrentButtons(), textSearchingOpponent);
            var indexOpp = 0;
            while (btnOpponent && indexOpp <= iterationSearchOpponentRestriction && !isBigFightTime()) {
                indexOpp++;
                clickBtn(btnOpponent);
                log('Clicked search opponent');
                await sleep(_20sec, true);

                if(isWarningAboutNotEnoughMoneyForArena()){
                    var timeToNextBigFight = getTimeToNexBigFight();
                    var sleepTime = timeToNextBigFight > _1hour ? _1hour : timeToNextBigFight;
                    await sleep(sleepTime, true);
                    continue mainLoop;
                }

                btnOpponent = findBtnByText(getCurrentButtons(), textSearchingOpponent);
            }

            if(!(indexOpp <= iterationSearchOpponentRestriction) || isBigFightTime()){ // click button 'назад'
                var btnBack = findBtnByText(getCurrentButtons(), textBack);
                checkAndClickBtn(btnBack, 'back button');
                await sleep(_30sec, true);
            }

            //waiting for starting fight
            var btnCancelSearching = findBtnByText(getCurrentButtons(), textCancelSearching);
            while (btnCancelSearching && !isBigFightTime()) {
                log('opponent isn\'t found yet :( ');
                await sleep(_10sec, true);
                btnCancelSearching = findBtnByText(getCurrentButtons(), textCancelSearching);
            }

            if(isBigFightTime()){ // if is fight time we must cancel fight and click back
                log('current time is for big fight');
                checkAndClickBtn(btnCancelSearching, 'cancel searching');
                await sleep(_30sec, true);

                var btnBack_ = findBtnByText(getCurrentButtons(), textBack);
                checkAndClickBtn(btnBack_, 'back button');
            }
            //##############################################################

            //fighting

            //the very first actions is hard coded.

            var timeBotMsg = getTimeLastChatWarsMsg();
            var wasFight = false;

            if(isFight(getCurrentButtons())) {
                clickBtn(getCurrentButtons()[0]);
                log('Clicked attack head');
                await sleep(_3sec, true);

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                while (timeBotMsg == getTimeLastChatWarsMsg()){
                    await sleep(_1sec, false);
                }
                timeBotMsg = getTimeLastChatWarsMsg();
                await sleep(_2sec, false);

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                clickBtn(getCurrentButtons()[2]);
                log('Clicked protect feed');
                await sleep(_5sec, true);

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                while (timeBotMsg == getTimeLastChatWarsMsg()){
                    await sleep(_1sec, false);
                }
                timeBotMsg = getTimeLastChatWarsMsg();
                await sleep(_2sec, false);

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                var i = 0;
                while (isFight(getCurrentButtons()) && work && i < iterationFightRestriction) {
                    log('  iteration  = ', ++i);
                    var randomBtn = getRandomButton(getCurrentButtons());
                    log('Will click: ' + randomBtn.innerText);
                    clickBtn(randomBtn);
                    await sleep(_3sec, true); // need less time for appearing button than for second choice

                    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    while (timeBotMsg == getTimeLastChatWarsMsg()){
                        await sleep(_1sec, false);
                    }
                    timeBotMsg = getTimeLastChatWarsMsg();
                    await sleep(_2sec, false);

                    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    if (getCurrentButtons().length > 3) { // it means final choice was done, go to next iteration
                        continue;
                    }

                    randomBtn = getRandomButton(getCurrentButtons());
                    log('Will click: ' + randomBtn.innerText);
                    clickBtn(randomBtn);
                    await sleep(_3sec, true);

                    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    while (timeBotMsg == getTimeLastChatWarsMsg()){
                        await sleep(_1sec, false);
                    }
                    timeBotMsg = getTimeLastChatWarsMsg();
                    await sleep(_2sec, false);

                    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                }
                wasFight = true;
            }
            if(wasFight) {
                log('Fight ended at : ' + new Date());
                // timeLastFight = new Date().getTime();
                // we don't need fight each 1 hour for arena 1.2
                timeLastFight = new Date().getTime() - (60 - 5) * 60 * 1000; // ~ 5 minute
            } else {
                log('There wasn\'t fight : ' + new Date());
                log('It will back in some period of time');
                timeLastFight = new Date().getTime() - (60 - 8) * 60 * 1000; // ~ 8 minute
            }
            //######################################################################

            log('going to def');

            var btnDefence = findBtnByText(getCurrentButtons(), textDefence);
            checkAndClickBtn(btnDefence, 'def button');
            await sleep(_30sec, true);

            log('going to click red flag');

            var btnRedFlag = findBtnByText(getCurrentButtons(), textRedFlag);
            checkAndClickBtn(btnRedFlag, 'red flag');
            await sleep(_30sec, true);
            //################################################################################

        } catch(err) {
            console.error(err.message);
            await sleep(_30sec, true);

        }
    }

}

main(/*minutes to fight*/);