const Jasmine = require('jasmine');
const jasmineuh = new Jasmine();

jasmineuh.loadConfigFile('src/spec/support/jasmine.json');
jasmineuh.configureDefaultReporter({
    showColors: false
});
jasmineuh.execute();
