import { createElement } from 'lwc';
import { registerLdsTestWireAdapter, registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import { getRecord } from 'lightning/uiRecordApi';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import getStamps from '@salesforce/apex/StampingHelper.getStamps';

import DrawAnnotation from 'c/drawAnnotation';

const mockGetRecord = require('./data/getRecord.json');
const mockGetStamps = require('./data/getStamps.json');

const getRecordWireAdapter = registerLdsTestWireAdapter(getRecord);
const getStampsAdapter = registerApexTestWireAdapter(getStamps);

/*
let mockScriptSuccess = true;

jest.mock(
    'lightning/platformResourceLoader',
    () => {
        return {
            loadScript() {
                return new Promise((resolve, reject) => {
                    // If the variable is false we're simulating an error when loading
                    // the script resource.
                    if (!mockScriptSuccess) {
                        reject('Could not load script');
                    } else {
                        global.fabric = require('../../../staticresources/fabric363/fabric.js');
                        resolve();
                    }
                });
            }
        };
    },
    { virtual: true }
);
*/

describe('c-draw-annotation', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    function flushPromises() {
        // eslint-disable-next-line no-undef
        return new Promise((resolve) => setImmediate(resolve));
    }

    it('Basic creation of canvas from Record Context', () => {
        DrawAnnotation.recordId = "a001h000003htBmAAI";
        DrawAnnotation.objectApiName = "Drawing__c";
    
        DrawAnnotation.canvasWidth = 50;
        DrawAnnotation.canvasHeight = 50;
        DrawAnnotation.autoLoad = false;
        DrawAnnotation.autoSave = false;
        
        const element = createElement('c-draw-annotation', {
            is: DrawAnnotation
        });
        document.body.appendChild(element);

        const flowHandler = jest.fn();
        element.addEventListener(FlowAttributeChangeEvent, flowHandler);

        getRecordWireAdapter.emit(mockGetRecord);
        DrawAnnotation.fieldName = "Drawing__c";

        getStampsAdapter.emit(mockGetStamps);

        //return Promise.resolve().then(() => {
        return flushPromises().then(() => {
            expect(element.stampsAdded).toBeGreaterThan(0);

            const el = element.shadowRoot.querySelector(".da-canvas");
            expect(el).not.toBeNull();
        });
    });
});