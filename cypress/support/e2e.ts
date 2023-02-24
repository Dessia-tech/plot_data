// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import addContext from 'mochawesome/addContext';

Cypress.on('test:after:run', (test, runnable) => {
    if (test.state === 'failed') {
        // Cypress.config('screenshotsFolder')
        // const screenshot = `${"screenshots"}/${Cypress.spec.name
        // }/${runnable.parent.title} -- ${test.title} (failed).png`;
        // const screenshot = `${"screenshots"}/${runnable.parent.title} -- ${test.title} (failed).png`;
        const screenshot = `${runnable.parent.title} -- ${test.title}`;
        addContext({ test }, "screenshots/" + screenshot + " (failed).png");
        addContext({ test }, `diff/${Cypress.spec.name}/` + screenshot + "-diff.png");
    }
});


// Alternatively you can use CommonJS syntax:
// require('./commands')
