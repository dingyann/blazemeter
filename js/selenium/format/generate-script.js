async function generateScriptOutput({ test_cases: testCases }, language) {
    const allCommands = getAllTestCasesCommands(testCases);
    return await loadScripts(allCommands, language);
}

const getAllTestCasesCommands = (testCases) => {
    const commands = testCases.reduce((allCommands, testCase) => {
        if (!testCase || !testCase.commands || !testCase.commands.length) {
            return allCommands;
        }

        const testCaseComment = {
            command: 'comment',
            value: 'Label: ' + testCase.testStep
        };

        return [
            ...allCommands,
            testCaseComment,
            ...testCase.commands
        ]
    }, []);

    return commands;
};

function ln(line) {
    return "\r\n" + line;
}

function getCommandsToGenerateScripts(suiteCommands) {
    return suiteCommands.map(function(command) {
       return new Command(command.command, command.target, command.value);
    });

}

async function loadScripts(s_suite, language) {
    let scriptNames = [];
    switch (language) {
        case 'cs-wd-nunit':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/remoteControl.js',
                '../js/selenium/format/csharp/cs-rc.js',
                '../js/selenium/format/webdriver.js',
                '../js/selenium/format/csharp/cs-wd.js'
            ];
            break;
        case 'cs-wd-mstest':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/remoteControl.js',
                '../js/selenium/format/csharp/cs-rc.js',
                '../js/selenium/format/webdriver.js',
                '../js/selenium/format/csharp/cs-wd.js',
                '../js/selenium/format/csharp/cs-mstest-wd.js'
            ];
            break;
        case 'java-wd-testng':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/remoteControl.js',
                '../js/selenium/format/java/java-rc.js',
                '../js/selenium/format/java/java-rc-junit4.js',
                '../js/selenium/format/java/java-rc-testng.js',
                '../js/selenium/format/webdriver.js',
                '../js/selenium/format/java/webdriver-testng.js'
            ];
            break;
        case 'java-wd-junit':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/remoteControl.js',
                '../js/selenium/format/java/java-rc.js',
                '../js/selenium/format/java/java-rc-junit4.js',
                '../js/selenium/format/java/java-rc-testng.js',
                '../js/selenium/format/webdriver.js',
                '../js/selenium/format/java/webdriver-junit4.js'
            ];
            break;
        case 'java-rc-junit':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/remoteControl.js',
                '../js/selenium/format/java/java-rc.js',
                '../js/selenium/format/java/java-rc-junit4.js',
                '../js/selenium/format/java/java-rc-testng.js',
                '../js/selenium/format/java/java-backed-junit4.js'
            ];
            break;
        case 'python-wd-unittest':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/remoteControl.js',
                '../js/selenium/format/python/python2-rc.js',
                '../js/selenium/format/webdriver.js',
                '../js/selenium/format/python/python2-wd.js'
            ];
            break;
        case 'robot':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/robot/robot.js'
            ];
            break;
        case 'ruby-wd-rspec':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/remoteControl.js',
                '../js/selenium/format/ruby/ruby-rc.js',
                '../js/selenium/format/ruby/ruby-rc-rspec.js',
                '../js/selenium/format/webdriver.js',
                '../js/selenium/format/ruby/ruby-wd-rspec.js'
            ];
            break;
        case 'xml':
            scriptNames = [
                '../js/selenium/format/formatCommandOnlyAdapter.js',
                '../js/selenium/format/xml/XML-formatter.js'
            ];
            break;
        default:
            break;
    }
    $("[id^=formatter-script-language-id-]").remove();
    var j = 0;
    for (var i = 0; i < scriptNames.length; i++) {
        var script = document.createElement('script');
        script.id = "formatter-script-language-id-" + language + '-' + i;
        script.src = scriptNames[i];
        script.async = false;
        script.onload = function() {
            j++;
        };
        document.head.appendChild(script);
    }
    const output = new Promise(resolve => {
        const interval = setInterval(
            function() {
                if (j === scriptNames.length) {
                    clearInterval(interval);
                    resolve(generateScript(s_suite));
                }
            },
            100
        );
    });
    return await output;
}


function generateScript(s_suite) {
    const testCase = new TestCase();
    testCase.commands = getCommandsToGenerateScripts(s_suite);
    return format(testCase, 'default test case name');
}

$(function() {
    $.ajax({
        url: 'js/selenium/format/iedoc-core.xml',
        success: function (document) {
            Command.apiDocuments = new Array(document);
        },
        async: false,
        dataType: 'xml'
    });
});
