const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');
module.exports = {
    ...jestConfig,
    // add any custom configurations here
    moduleNameMapper: {
        '^@salesforce/apex$':
            '<rootDir>/lightning-components/test/jest-mocks/apex',
        '^lightning/uiRecordApi$':
            '<rootDir>/lightning-components/test/jest-mocks/lightning/uiRecordApi',
        '^lightning/flowSupport$':
            '<rootDir>/lightning-components/test/jest-mocks/lightning/flowSupport',
    }
};