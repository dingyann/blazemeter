INITIAL INSTALL
1. Install node
2. Install Tape
   npm install tape --save-dev

3. Install Browserfiy
   npm install -g browserify testling

INSTALL
npm install

USAGE

Convert Tape test into browser test:
browserify test.js > browser.js

RUN TESTS IN BROWSER:
chrome-extension://aaadfnhfcbhlmdgifomekiocondhffna/tests/test.html

replace aaad... with chrome extension id
