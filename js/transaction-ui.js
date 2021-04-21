//@todo: implement chrome.tabs.onactive and reload iframe contents?
var background = chrome.extension.getBackgroundPage();
var localFunctionalTransactions = [];
var localHttpTransactions = [];
var tabKeyPressed = false;
var lastHttpTransactionCounter = 0;

$(document).ready(function () {
    getFunctionalTransactions().then(functionalTransactions => {
        chrome.storage.local.get('transactions', function (items) {
            localHttpTransactions = items.transactions;
            renderTransactions(functionalTransactions, localHttpTransactions);
        });
    });

    //Enable/disable Save button
    $('#transaction_name').keyup(function () {
        if (!$(this).val()) {
            $('#save-transaction').addClass('disabled');
            document.getElementById('save-transaction').disabled = true;
        } else {
            $('#save-transaction').removeClass('disabled');
            document.getElementById('save-transaction').disabled = false;
        }
    });

    $('#transaction_name').attr('placeholder', '2 Test case / Label');

    $('#transaction_name').keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
        }
    });

    $(document).on('click', '.transaction-name', function () {
        $(this).hide();
        $(this).next().show();
        $(this).next().focus();
        $(this).next().val($(this).text());
    });

    //Allows to capture tab key
    $(document).on('keydown', '.transaction-input', function (event) {
        tabKeyPressed = event.keyCode === 9;
        if (tabKeyPressed) {
            event.preventDefault();

        }
    });

    //Edit transaction name
    $(document).on('keyup', '.transaction-input', function (event) {
        if (event.keyCode === 13 || tabKeyPressed) {
            //Typing enter commits name change
            $(this).hide();
            $(this).prev().show();
            $(this).prev().focus();
            var key = $(this).data('key');
            var transactionName = $(this).val();
            if (!background.stringIsEmpty(transactionName)) {
                $(this).prev().text(transactionName);
                var transactionObject = localFunctionalTransactions[key];
                transactionObject.name = transactionName;
                localFunctionalTransactions[key] = transactionObject;

                //Update TestCase name
                chrome.runtime.sendMessage({
                    command: 'updateTestCaseName',
                    testCaseName: transactionName,
                    testCaseIndex: key
                });
            }
            tabKeyPressed = false;
        } else if (event.keyCode == 27) {
            //Esc cancels the name change
            $(this).hide();
            $(this).prev().show();
            $(this).prev().focus();
        }
    });

    $(document).on('focusout', '.transaction-input', function (event) {
            //Typing enter commits name change
            $(this).hide();
            $(this).prev().show();
            $(this).prev().focus();
            var key = $(this).data('key');
            var transactionName = $(this).val();
            if (!background.stringIsEmpty(transactionName)) {
                $(this).prev().text(transactionName);
                var transactionObject = localFunctionalTransactions[key];
                transactionObject.name = transactionName;
                localFunctionalTransactions[key] = transactionObject;

                //Update TestCase name
                chrome.runtime.sendMessage({
                    command: 'updateTestCaseName',
                    testCaseName: transactionName,
                    testCaseIndex: key
                });

                saveEditedTransactionName.call($(this));
            }
            background.mixpanelTrack('CE Transaction Name Edited');
            tabKeyPressed = false;
    });

    function saveEditedTransactionName() {
        var key = $(this).data('key');
        var transactionName = $(this).val();
        if (!background.stringIsEmpty(transactionName)) {
            $(this).prev().text(transactionName);
            var transactionObject = localHttpTransactions[key];
            transactionObject.name = transactionName;
            localHttpTransactions[key] = transactionObject;
            background.localSave({
                'transactions': localHttpTransactions
            });
        }
    }

    //Cancel name change when out of focus
    $('.transaction-input').focusout(function () {
        $(this).hide();
        $(this).prev().show();
        $(this).prev().focus();
    });

    // Check for Mac or IOS using
    function isMacOrIOS() {
        var platform = navigator.platform;
        var isMac = platform.indexOf('Mac') > -1;
        var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        var isIos = iosPlatforms.indexOf(platform) !== -1;
        if(isMac || isIos) {
            return true;
        }
        return false;
    }

    // If Using Mac or IOS add class 'mac'
    function addMacClass() {
        if(isMacOrIOS()) {
            $('#transaction-content').addClass('mac');
        }
    }
    addMacClass();

    //User can type Enter to add the transaction or press Esc to reset the entry field
    $(document).on('keyup', '#transaction_name', function (event) {
        if (event.keyCode == 13) {
            //Typing enter commits name change
            addNewTransaction($(this).val());
            $(this).val('');
            $('#save-transaction').addClass('disabled');
            $('#transaction-list').scrollTop($('#transactions')[0].scrollHeight);
            background.mixpanelTrack('CE New Transaction Name Entered');
        } else if (event.keyCode == 27) {
            //Esc cancels the name change
            $(this).val('');
            $('#save-transaction').addClass('disabled');
        }
    });

    //Save Transaction button
    $('#save-transaction').click(function () {
        background.mixpanelTrack('CE New Transaction Name Entered');
        var transactionName = $('#transaction_name').val();
        addNewTransaction(transactionName);
        $('#transaction_name').val('');
        background.mixpanelTrack('CE Save Transaction Clicked');
        $('#save-transaction').addClass('disabled');
    });

    function liType(name, key, functionalTransactionCounter, httpTransactionCounter) {
        return '<li><span class="transaction-name">' + name + '</span> <input class="transaction-input" data-key="' + key + '"><span class="transaction-counter-wrapper">(<span class="functional-transaction-counter">' + functionalTransactionCounter + '</span>)(<span class="http-transaction-counter">' + httpTransactionCounter + '</span>)</span></li>';
    }

    function transactionHeader(numOfTransactions) {
        if (numOfTransactions == 1) {
            $('.transaction-title label').html(numOfTransactions + ' Test case / Label');
        } else {
            $('.transaction-title label').html(numOfTransactions + ' Test cases / Labels');
        }
    }

    function addNewTransaction(transactionName) {
        if (!background.stringIsEmpty(transactionName)) {
            //Http new transaction handler
            var httpKey = localHttpTransactions.length - 1;
            if (httpKey >= 0) {
                var totalPreviousCounter = $.totalPreviousCounter();
                var newCounter = background.counter - totalPreviousCounter;
                // if (newCounter == 0) {
                //     //Prevent adding new Transaction name if counter =0
                //     return;
                // }
                localHttpTransactions[httpKey].counter = newCounter;
                //update counter in html
                $('#transactions li:last-child .http-transaction-counter').html(newCounter);
            }
            //Save new transaction name
            var httpTransactionObject = {name: transactionName, counter: 0};
            localHttpTransactions.push(httpTransactionObject);
            background.localSave({
                'transactions': localHttpTransactions
            });

            //Update counter of previous transaction
            var key = localFunctionalTransactions.length;
            //Create new testCase in the suite
            chrome.runtime.sendMessage({command: 'addTestCase', testCaseName: transactionName});
            //Save new transaction name
            var transactionObject = {name: transactionName, counter: 0};
            localFunctionalTransactions.push(transactionObject);

            const stepsCount = key + 2;
            $('#transaction_name').attr('placeholder', `${stepsCount} Test case / Label`);

            $('#transactions').append(liType(transactionName, httpKey, 0, 0));

            transactionHeader(localFunctionalTransactions.length);
            $('#transaction-content .help-text').hide();

            lastHttpTransactionCounter = 0;
            $('#save-transaction').addClass('disabled').attr('disabled', 'disabled');
            $('#transaction_name').attr('disabled', 'disabled');
        }
    }

    function getFunctionalTransactions() {
        return new Promise(function (resolve, reject) {
            browser.runtime.sendMessage({command: 'getTransactions'}).then(response => {
                resolve(response.transactions);
            }).catch(err => {
                //Fail silently
            });
        });
    }

    function renderTransactions(functionalTransactions, httpTransactions) {
        $('#transactions').html('');
        localFunctionalTransactions = functionalTransactions;

        localFunctionalTransactions.forEach(function (transactionObject, key, array) {
            let newHttpCounter;
            if (key == localHttpTransactions.length - 1) {
                var totalPreviousCounter = $.totalPreviousCounter();
                newHttpCounter = background.counter - totalPreviousCounter;
                lastHttpTransactionCounter = newHttpCounter;
            } else {
                newHttpCounter = localHttpTransactions[key].counter;
            }
            $('#transactions').append(liType(transactionObject.name, key, transactionObject.counter, newHttpCounter));
        });
        if (localFunctionalTransactions.length > 0) {
            transactionHeader(localFunctionalTransactions.length);
            $('#transaction-content .help-text').hide();
            //On iframe reload scroll down to last transaction label
            $('#transaction-list').scrollTop($('#transactions')[0].scrollHeight);
        }

        //Enable/Disable the user to add new transactions if previous one was empty
        toggleAddTransaction(checkLastTransactionEmpty(functionalTransactions, lastHttpTransactionCounter));

    }

    function getTransactionsFromSuite(suite) {
        let transactions = [];
        for (let i = 0; i < suite.test_cases.length; i++) {
            let t = {};
            t.name = suite.test_cases[i].testStep;
            t.counter = suite.test_cases[i].commands.length;
            transactions.push(t);
        }
        return transactions;
    }

    function updateFunctionalCounter(value) {
        $('#transactions li:last-child .functional-transaction-counter').html(value);
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.command == 'recorderNotification') {
            if (request.observable.recording == 'stopped') {
                $('#save-transaction').attr('disabled', 'disabled').addClass('disabled');
                $('#transaction_name').attr('disabled', 'disabled');
            }
        }
        if (request.command == 'testSuiteNotification') {
            let observableSuite = request.observable;
            let functionalTransactions = getTransactionsFromSuite(observableSuite);
            let lastTransaction = functionalTransactions[functionalTransactions.length - 1];
            updateFunctionalCounter(lastTransaction.counter);
            chrome.storage.local.get('transactions', items => {
                localHttpTransactions = items.transactions;
                renderTransactions(functionalTransactions, localHttpTransactions);
                //Enable/Disable depending if last transaction was empty
                toggleAddTransaction(checkLastTransactionEmpty(functionalTransactions, lastHttpTransactionCounter));
            });
            // if(request.options){
            //     let options = request.options;
            //     switch(options.action){
            //         case "addCommand":
            //             console.log('Added new command');
            //             break;
            //         case "addTestCase":
            //             console.log('Added new testCase');
            //
            //             //Render new transactions
            //             var httpKey = localHttpTransactions.length - 1;
            //             let transactionName = observableSuite.test_cases[options.indexes.testCaseIndex].testStep;
            //             $('#transactions').append(liType(transactionName, httpKey, 0, 0));
            //             transactionHeader(localFunctionalTransactions.length);
            //             $('#transaction-content .help-text').hide();
            //             lastHttpTransactionCounter = 0;
            //             $('#save-transaction').addClass('disabled').attr('disabled', 'disabled');
            //             $('#transaction_name').attr('disabled', 'disabled');
            //
            //             break;
            //     }
            // }
        }

        //Http transaction update
        if (request.counter) {
            chrome.storage.local.get('transactions', function (items) {
                localHttpTransactions = items.transactions;
                var totalPreviousCounter = $.totalPreviousCounter();
                var newCounter = request.counter - totalPreviousCounter;
                //Update local variable
                lastHttpTransactionCounter = newCounter;
                //Enable/Disable depending if last transaction was empty
                toggleAddTransaction(checkLastTransactionEmpty(localFunctionalTransactions, lastHttpTransactionCounter));
                //update counter in html
                $('#transactions li:last-child .http-transaction-counter').html(newCounter);
            });
        }
    });

    //Http transactions
    $.totalPreviousCounter = function totalPreviousCounter() {
        var totalCounter = 0;
        localHttpTransactions.forEach(function (transactionObject, key, array) {
            totalCounter += transactionObject.counter;
        });
        return totalCounter;
    };

    function toggleAddTransaction(flag) {
        if (flag) {
            $('#transaction_name').val('').attr('disabled', 'disabled');
            $('#save-transaction').addClass('disabled').attr('disabled', 'disabled');
        } else {
            $('#save-transaction').removeClass('disabled').removeAttr('disabled');
            $('#transaction_name').removeAttr('disabled');
        }
    }

    function checkLastTransactionEmpty(localFunctionalTransactions, httpTransactionCounter) {
        //Either functional or http last transaction is empty
        if ((jQuery.isEmptyObject(localFunctionalTransactions) && jQuery.isEmptyObject(httpTransactionCounter)) || localFunctionalTransactions[localFunctionalTransactions.length - 1].counter === 0 && httpTransactionCounter === 0) {
            return true;
        }
        return false;
    }
});

