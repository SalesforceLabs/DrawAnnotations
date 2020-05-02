/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

import { getSObjectValue } from '@salesforce/apex';
import getStamps from '@salesforce/apex/StampingHelper.getStamps';
// watch out for Custom Metadata Types, they can't be used
// with import field from '@salesforce/schema...' calls
// see Import Limitations at https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_wire_service_about
const LABEL_FIELD = 'c25draw__DA_Stamps__mdt.MasterLabel';
const SVG_FIELD = 'c25draw__DA_Stamps__mdt.Stamp_SVG_String__c';
const SVG_FIELD_WITH_NS = 'c25draw__DA_Stamps__mdt.c25draw__Stamp_SVG_String__c';

import staticResources from "@salesforce/resourceUrl/backgrounds";

export default class DrawAnnotation extends LightningElement {

    @api recordId;
    @api objectApiName;
    @api flexipageRegionWidth; //https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_width_aware

    // Config Properties
    @api fieldName;
    @api autoSave = false;
    @api autoLoad = false;
    @api captureSave = false;
    @api get canHandleSave() {
        return this.autoSave || this.captureSave;
    }
    @api currentCanvasOut = "{}";
    @api currentPngOut = "";
    @api backgroundImage = "";
    calcBackgroundImage = "";
    @api canvasWidth = 500;
    @api canvasHeight = 300;
    @api allowCanvasResize = false;
    @api stampingMode = false;
    @api drawingMode = false;

    /* === ===
     * Data Management
     */
    _record;
    fieldsFormatted; // keep this unassigned as it gets assigned dynamically
    @wire(getRecord, { recordId: "$recordId", fields: "$fieldsFormatted" })
    wiredRecord({ error, data }) {
        if (error) {
            this.logAndDisplayError("Error loading wiredRecord of getRecord", error);
        } else { // if (data) {
            this._record = data;
            if (this.autoLoad) {
                // map the record value into the canvas value
                this.getCanvas().currentCanvasValue = this.currentRecordValue;
                this.loadBackgroundImage(); // overwrite the loaded value
            }
        }
    }
    get currentRecordValue() {
        let result = "";
        if (this._record) {
            result = getFieldValue(this._record, this.formatFieldName(this.fieldName));
        }
        return result;
    }
    set currentRecordValue(value) {
        if (this.autoSave) {
            let recInput = this.createRecordInput(value);
            updateRecord(recInput)
                .then(() => {
                })
                .catch(error => {
                    this.logAndDisplayError("Error updating updateRecord", error);
                }); // update record
        }
    }

    _stamps;
    _stampsAdded;
    @api get stampsAdded() {
        return this._stampsAdded;
    }
    @wire(getStamps)
    wiredStamps({ error, data }) {
        if (error) {
            this.logAndDisplayError("Error loading wiredRecord of getRecord", error);
        } else { // if (data) {
            this._stamps = data;
            this._stampsAdded = 0;
            this.loadStamps();
        }
    }
    loadStamps() {
        if (this._stamps && this.getCanvas()) {
            for (let i = 0; i < this._stamps.length; i++) {
                let mLabel = getSObjectValue(this._stamps[i], LABEL_FIELD);
                let svgField = getSObjectValue(this._stamps[i], SVG_FIELD);
                svgField = svgField ? svgField : getSObjectValue(this._stamps[i], SVG_FIELD_WITH_NS);
                if (mLabel && mLabel != "") {
                    this.getCanvas().addStampOption(mLabel, svgField);
                    if (this.stampingMode) {
                        this.getCanvas().interactionMode(this.getCanvas().stampingMode);
                    }
                    this._stampsAdded += 1;
                }
            }
        }
    }

    // call after the child canvas is created and available
    renderedCallback() {
        this.calcBackgroundImage = staticResources + "/" + this.backgroundImage;

        this.loadBackgroundImage(); // load the image to a blank canvas

        if (this.autoLoad) {
            let fields = [this.fieldName, "Id"];
            this.fieldsFormatted = fields.map(field => this.formatFieldName(field));
        }

        this.loadStamps();

        if (this.getCanvas()) {
            if (this.stampingMode) {
                this.getCanvas().interactionMode(this.getCanvas().stampingMode);
            } else if (this.drawingMode) {
                this.getCanvas().interactionMode(this.getCanvas().drawingMode);
            } else {
                this.getCanvas().interactionMode(this.getCanvas().fullMode);
            }
        }
    }

    handleSaveCanvas(event) {
        if (this.autoSave) {
            this.currentRecordValue = this.getCanvas().currentCanvasValue;
        } else if (this.captureSave) {
            this.currentCanvasOut = this.getCanvas().currentCanvasValue;
            const canvasChangeEvent = new FlowAttributeChangeEvent("currentCanvasOut", this.currentCanvasOut);
            this.dispatchEvent(canvasChangeEvent);

            // need to disconnect this from the above so the canvas renders
            setTimeout(() => {
                // http://santanuboral.blogspot.com/2019/10/LWC-capture-signature.html
                this.currentPngOut = this.getCanvas().currentCanvasPng;

                const pngChangeEvent = new FlowAttributeChangeEvent("currentPngOut", this.currentPngOut);
                this.dispatchEvent(pngChangeEvent);
            }, 500);
        }
    }

    loadBackgroundImage() {
        if (this.backgroundImage && this.backgroundImage != "") {
            this.getCanvas().backgroundImage = this.calcBackgroundImage;
        } 
    }

    createRecordInput(value) {
        let result = {
            "fields" : {}
        }

        result.fields["Id"] = this.recordId;
        result.fields[this.fieldName] = value;
        return result;
    }
    formatFieldName(fname) {
        return this.objectApiName + "." + fname;
    }
    getCanvas() {
        return this.template.querySelector(".da-canvas");
    }

    /* === ===
     * Logging utilities
     */
    logTextEvent(text) {
        console.log(text);
    }
    logObjectEvent(text, obj) {
        this.logTextEvent(text);
        console.log(obj);
    }
    logAndDisplayError(text, error) {
        this.logObjectEvent(text, error);
    }
}