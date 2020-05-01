/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
//import { ShowToastEvent } from 'lightning/platformShowToastEvent'

import fabricLibrary from '@salesforce/resourceUrl/fabric363';

const CONTAINER_HTML = `<div class="draw-annotation-wrapper">
    <canvas class="draw-annotation-canvas draw-annotation-canvas-lower"></canvas>
    <canvas class="draw-annotation-canvas draw-annotation-canvas-upper"></canvas>
    </div>`

const INTERACTION_MODE ={
    FULL: "full",
    STAMPING: "stamping",
    DRAWING: "drawing",
}
Object.freeze(INTERACTION_MODE);
const TOOLBAR = {
    SELECTION: "selection",
    DRAWING: "drawing",
    TEXT: "text",
    SHAPES: "shapes",
    STAMPS: "stamps",
}
Object.freeze(TOOLBAR);
const MENUITEM = {
    SHAPE_LINE: "shapeLine",
    SHAPE_CIRCLE: "shapeCircle",
    SHAPE_ELLIPSE: "shapeEllipse",
    SHAPE_SQUARE: "shapeSquare",
    SHAPE_RECTANGLE: "shapeRectangle",
    SHAPE_TRIANGLE: "shapeTriangle",
}
Object.freeze(MENUITEM);

export default class DrawAnnotationCanvas extends LightningElement {

    // Config Properties
    @api fireAutoSave = false;

    /* === ===
     * Mode Management
     */
    _interactionMode = INTERACTION_MODE.FULL;
    get hideToolbar() {
        return !this.isFullMode;
    }
    @api get isFullMode() {
        return this._interactionMode === INTERACTION_MODE.FULL;
    }
    @api get isStampingMode() {
        return this._interactionMode === INTERACTION_MODE.STAMPING;
    }
    @api get isDrawingMode() {
        return this._interactionMode === INTERACTION_MODE.DRAWING;
    }
    @api interactionMode(value) {
        if (value === INTERACTION_MODE.STAMPING) {
            this._interactionMode = INTERACTION_MODE.STAMPING;
        } else if (value === INTERACTION_MODE.DRAWING) {
            this._interactionMode = INTERACTION_MODE.DRAWING;
        } else {
            this._interactionMode = INTERACTION_MODE.FULL;
        }
    }
    @api get fullMode() {return INTERACTION_MODE.FULL}
    @api get stampingMode() {return INTERACTION_MODE.STAMPING}
    @api get drawingMode() {return INTERACTION_MODE.DRAWING}

    /* === ===
     * Canvas Data Management
     */
    _canvas = null;
    @api canvasWidth = 1000;
    @api canvasHeight = 400;
    _allowCanvasResize = false;
    @api get allowCanvasResize() {
        return this._allowCanvasResize;
    }
    set allowCanvasResize(value) {
        this._allowCanvasResize = value;
        if (this._handleCanvasResize) {
            if (value) {
                window.addEventListener("load", this._handleCanvasResize);
                window.addEventListener("resize", this._handleCanvasResize);
            } else {
                window.removeEventListener("load", this._handleCanvasResize);
                window.removeEventListener("resize", this._handleCanvasResize);
            }
        }
    }
    _loadingCanvas = false;
    _handleCanvasResize;
    _canvasValue = "";
    _canvasPngValue = "";
    @api get currentCanvasValue() {
        if (this._canvas) {
            this._canvasValue = JSON.stringify(this._canvas);
        }
        return this._canvasValue;
    }
    set currentCanvasValue(value) {
        this._canvasValue = value;
        if (this._canvas) {
            this.loadCanvasValue();
        }
    }
    loadCanvasValue() {
        this._loadingCanvas = true;
        this._canvas.loadFromJSON(this._canvasValue);
        this.toggleSelectable(false);
        this._loadingCanvas = false;
    }
    @api get currentCanvasPng() {
        if (this._canvas) {
            this._canvasPngValue = this._canvas.toDataURL({
                format: "png"
            });
        }
        return this._canvasPngValue;
    }
    _backgroundImage = "";
    @api get backgroundImage() {
        return this._backgroundImage;
    }
    set backgroundImage(value) {
        this._backgroundImage = value;
        this.overrideBackgroundImage();
    }
    overrideBackgroundImage() {
        if (this._canvas && this._backgroundImage && this._backgroundImage != "") {
            this._loadingCanvas = true;
            this._canvas.setBackgroundImage(this._backgroundImage,
                this._canvas.renderAll.bind(this._canvas),
                {}
            );
            this._loadingCanvas = false;
        }
    }

    /* === ===
     * Options
     */
    _fillColor = '#FFFFFF';
    _lineColor = '#000000';
    _lineWidth = 2;
    @track fontOptions = {
        fontSize: 40,
        fontFamily: "serif",
        fontStyle: "normal",
        fontWeight: "normal",
        underline: false,
        linethrough: false,
        overline: false,
        textAlign: "left",
        lineHeight: 1,
    };
    get currentFontFamilyOptions () {
        return [
            { label: "Serif", value: "serif" },
            { label: "Sans-Serif", value: "sans-serif" },
            { label: "Monospace", value: "monospace" },
        ];
    }

    /* === ===
     * Mouse
     */
    mousePos = {
        isDown: false,
        downX: 100,
        downY: 100,
        upX: 100,
        upY: 100,
        movementX: 100,
        movementY: 100,
    };

    /* === ===
     * Toolbar
     */
    currentToolbar;
    currentMenuItem;
    // selectable toolbar buttons
    @track selected = {
        select: false,
        drawing: false,
        text: false,
        shapes: false,
        stamps: false,
    }
    // arrays still need @track: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/reactivity_fields
    @track shapes = [
        {
            id: "shapeLine",
            label: "Line",
            class: "toolbar-shape toolbar-shape-line",
            checked: false,
            toolbar: TOOLBAR.SHAPES,
            menuitem: MENUITEM.SHAPE_LINE,
        },
        {
            id: "shapeCircle",
            label: "Circle",
            class: "toolbar-shape toolbar-shape-circle",
            checked: false,
            toolbar: TOOLBAR.SHAPES,
            menuitem: MENUITEM.SHAPE_CIRCLE,
        },
        {
            id: "shapeEllipse",
            label: "Ellipse",
            class: "toolbar-shape toolbar-shape-ellipse",
            checked: false,
            toolbar: TOOLBAR.SHAPES,
            menuitem: MENUITEM.SHAPE_ELLIPSE,
        },
        {
            id: "shapeSquare",
            label: "Square",
            class: "toolbar-shape toolbar-shape-square",
            checked: false,
            toolbar: TOOLBAR.SHAPES,
            menuitem: MENUITEM.SHAPE_SQUARE,
        },
        {
            id: "shapeRectangle",
            label: "Rectangle",
            class: "toolbar-shape toolbar-shape-rectangle",
            checked: false,
            toolbar: TOOLBAR.SHAPES,
            menuitem: MENUITEM.SHAPE_RECTANGLE,
        },
        {
            id: "shapeTriangle",
            label: "Triangle",
            class: "toolbar-shape toolbar-shape-triangle",
            checked: false,
            toolbar: TOOLBAR.SHAPES,
            menuitem: MENUITEM.SHAPE_TRIANGLE,
        },
    ];

    @api get hasStamps() {
        return this.stamps.length > 0;
    }
    @track stamps = [];
    @api addStampOption(label, svgString) {
        let coreId = label.toLowerCase().replace(/ /g,"-");
        this.stamps.push({
            id: "stamp" + coreId,
            label: label,
            class: "toolbar-stamp toolbar-stamp-" + coreId,
            checked: false,
            toolbar: TOOLBAR.STAMPS,
            menuitem: coreId,
            svgString: svgString,
        });

        if (this.isStampingMode) {
            this.menuitem = coreId;
            this.toolbar = TOOLBAR.STAMPS;
            this.resolveMenuItemClick(label, this.stamps);
        }
    }

    connectedCallback() {

        Promise.all([
            loadScript(this, fabricLibrary + "/fabric.js")
        ]).then(() => {

            // ideas from https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-resource-loader/documentation

            // initialize the library using a reference to the container element obtained from the DOM

            const container = this.template.querySelector(".draw-annotation-container");
            container.innerHTML = CONTAINER_HTML;

            const wrapperEl = this.template.querySelector(".draw-annotation-wrapper");
            const lowerEl   = this.template.querySelector(".draw-annotation-canvas-lower");
            const upperEl   = this.template.querySelector(".draw-annotation-canvas-upper");

            //lowerEl.width  = this.canvasWidth;
            //lowerEl.height = this.canvasHeight;
            //upperEl.width  = this.canvasWidth;
            //upperEl.height = this.canvasHeight;

            if (typeof fabric != "undefined") {
                this._canvas = new fabric.Canvas(lowerEl,
                {
                    wrapperEl: wrapperEl,
                    upperCanvasEl: upperEl,
                    width: this.canvasWidth,
                    height: this.canvasHeight,
                });

                this._handleCanvasResize = this.handleCanvasResize.bind(this);
                if (this.allowCanvasResize) {
                    window.addEventListener("load", this._handleCanvasResize);
                    window.addEventListener("resize", this._handleCanvasResize);
                }

                if (this.isStampingMode) {
                    if (this.stamps.length > 0) {
                        let stamp = this.stamps[this.stamps.length - 1];
                        this.menuitem = stamp.menuitem;
                        this.toolbar = stamp.toolbar;
                        this.resolveMenuItemClick(stamp.label, this.stamps);
                    }
        
                    this.setToolbar(TOOLBAR.STAMPS, false);
                } else if (this.isDrawingMode) {
                    this.setToolbar(TOOLBAR.DRAWING, false);
                } else {
                    this.setToolbar(TOOLBAR.SELECTION, false);
                }

                /* === ===
                * Set up event hooks
                */
                let mycomponent = this; // needed for scoping issues
                this._canvas.on("mouse:down", function(options) {
                    mycomponent.handleMouseDown(options);
                });
                /*this._canvas.on("mouse:move", function(options) {
                    mycomponent.handleMouseMove(options);
                });*/
                this._canvas.on("mouse:up", function(options) {
                    mycomponent.handleMouseUp(options);
                });
                /*this._canvas.on("selection:created", function(options) {
                    mycomponent.handleSelected(options);
                });*/
                /*this._canvas.on("selection:cleared", function(options) {
                    mycomponent.handleUnSelected(options);
                });*/
                this._canvas.on("path:created", function(options) {
                    mycomponent.handlePathCreated(options);
                });
                this._canvas.on("object:moved", function(options) {
                    mycomponent.handleObjectModified(options);
                });
                this._canvas.on("object:skewed", function(options) {
                    mycomponent.handleObjectModified(options);
                });
                this._canvas.on("object:scaled", function(options) {
                    mycomponent.handleObjectModified(options);
                });
                this._canvas.on("object:rotated", function(options) {
                    mycomponent.handleObjectModified(options);
                });
                this._canvas.on("object:modified", function(options) {
                    mycomponent.handleObjectModified(options);
                });

                this.loadCanvasValue();
                this.overrideBackgroundImage();
            }
        })
        .catch(error => {
            this.logAndDisplayError("Error creating canvas", error);
        });
    }

    disconnectedCallback() {
        window.removeEventListener("load", this._handleCanvasResize);
        window.removeEventListener("resize", this._handleCanvasResize);
    }

    handleCanvasResize() {
        const container = this.template.querySelector(".draw-annotation-container");
        let width = Math.min(container.offsetWidth, this.canvasWidth);
        let height = Math.min(container.offsetHeight, this.canvasHeight);

        this._canvas.setDimensions({
            width: width,
            height: height
        });
    }

    /* === ===
     * Canvas Events
     */
    handleMouseDown(options) {
        this.mousePos.isDown = true;
        this.setMouseXY(options);
    }
    handleMouseMove(options) {

    }
    handleMouseUp(options) {
        this.mousePos.isDown = false;
        this.setMouseXY(options);

        if (this.selected.shapes || this.selected.text || this.selected.stamps) {
            this.generateObject();
        }
    }
    handleSelected(options) {

    }
    handleUnSelected(options) {

    }
    handlePathCreated(newpath) {
        newpath.selectable = false;
        this.autoSave();
    }
    handleObjectModified(options) {
        this.autoSave();
    }

    /* === ===
     * Toolbar Commands
     */
    handleFillColorChange(event) {
        this._fillColor = event.detail.value;
        this.setToolbar(this.currentToolbar, false);
    }

    handleLineColorChange(event) {
        this._lineColor = event.detail.value;
        this.setToolbar(this.currentToolbar, false);
    }

    handleLineWidthChange(event) {
        this._lineWidth = this.resolveNumberChange(this._lineWidth, event);
        this.setToolbar(this.currentToolbar, false);
    }

    handleTextSizeChange(event) {
        this.fontOptions.fontSize = this.resolveNumberChange(this.fontOptions.fontSize, event);
        this.setToolbar(this.currentToolbar, false);
    }

    resolveNumberChange(input, event) {
        let result = input;
        if (event.detail.value) {
            result = parseInt(event.detail.value);
        }
        return result;
    }

    handleFontFamilyChange(event) {
        this.fontOptions.fontFamily = event.detail.value;
        this.setToolbar(this.currentToolbar, false);
    }

    handleSaveClick(event) {
        this.dispatchEvent(
            new CustomEvent('savecanvas')
        );
    }

    handleDeleteClick(event) {
        let foundObject = false;
        this._canvas.getActiveObjects().forEach((obj) => {
            this._canvas.remove(obj);
            foundObject = true;
        });
        if (foundObject) {
            this._canvas.discardActiveObject().renderAll();
            this.autoSave();
        }
    }

    handleSelectionClick(event) {
        this.setToolbar(TOOLBAR.SELECTION, true);
    }

    handlePencilClick(event) {
        this.setToolbar(TOOLBAR.DRAWING, true);
    }

    handleTextClick(event) {
        this.setToolbar(TOOLBAR.TEXT, true);
    }

    handleFakeShapeClick(event) {
        this.template.querySelector(".toolbar-shape-menu").click();
    }
    handleShapeClick(event) {
        this.resolveMenuItemClick(event.target.label, this.shapes);
    }

    handleFakeStampClick(event) {
        this.template.querySelector(".toolbar-stamp-menu").click();
    }
    handleStampClick(event) {
        this.resolveMenuItemClick(event.target.label, this.stamps);
    }

    resolveMenuItemClick(label, items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.checked = item.label === label;
            if (item.checked) {
                this.currentMenuItem = item.menuitem;
                this.setToolbar(item.toolbar, false);
            }
        }
    }

    /* === ===
     * Canvas Interactions
     */
    generateObject() {
        let currentObject = null;
        let setToSelect = false;
        let opt = {
            fill: this._fillColor,
            stroke: this._lineColor,
            strokeWidth: this._lineWidth,
            width: this.mousePos.movementX,
            height: this.mousePos.movementY,
            originX: 'left',
            originY: 'top',
        };
        this.setTopLeft(opt);
        
        if (this.currentToolbar === TOOLBAR.TEXT) {
            setToSelect = true;
            opt = Object.assign(opt, this.fontOptions);
            opt.fill = this._lineColor; // make fill & stroke the same for text
            currentObject = new fabric.IText('Text Here', opt);
        } else if (this.currentToolbar === TOOLBAR.SHAPES) {
            if (this.currentMenuItem === MENUITEM.SHAPE_LINE) {
                let points = [
                    this.mousePos.downX,
                    this.mousePos.downY,
                    this.mousePos.upX,
                    this.mousePos.upY,
                ];
                currentObject = new fabric.Line(points, opt);
            } else if (this.currentMenuItem === MENUITEM.SHAPE_CIRCLE) {
                opt.radius = Math.max(this.mousePos.movementX, this.mousePos.movementY) / 2;

                currentObject = new fabric.Circle(opt);
            } else if (this.currentMenuItem === MENUITEM.SHAPE_ELLIPSE) {
                opt.rx = Math.max(this.mousePos.movementX, this.mousePos.movementX) / 2;
                opt.ry = Math.max(this.mousePos.movementY, this.mousePos.movementY) / 2;
                currentObject = new fabric.Ellipse(opt);
            } else if (this.currentMenuItem === MENUITEM.SHAPE_SQUARE) {
                opt.height = this.mousePos.movementX; // special case for square
        
                currentObject = new fabric.Rect(opt);
            } else if (this.currentMenuItem === MENUITEM.SHAPE_RECTANGLE) {
                currentObject = new fabric.Rect(opt);
            } else if (this.currentMenuItem === MENUITEM.SHAPE_TRIANGLE) {
                currentObject = new fabric.Triangle(opt);
            }
        } else if (this.currentToolbar === TOOLBAR.STAMPS) {
            for (let i = 0; i < this.stamps.length; i++) {
                if (this.currentMenuItem === this.stamps[i].menuitem) {
                    let mycomponent = this;
                    delete opt.fill;
                    delete opt.stroke;
                    delete opt.strokeWidth;
                    delete opt.width;
                    delete opt.height;
                    opt.originX = 'center';
                    opt.originY = 'center';
        
                    currentObject = fabric.loadSVGFromString(this.stamps[i].svgString,
                        function(objects) {
                            for (let obj of objects) {
                                obj.set(opt);
                                mycomponent.addGeneratedObject(obj, false);
                            }
                        });
                }
            }
        }

        this.addGeneratedObject(currentObject, setToSelect);
    }

    addGeneratedObject(currentObject, setToSelect) {
        if (currentObject) {
            currentObject.selectable = setToSelect;
            this._canvas.add(currentObject);
            if (setToSelect) {
                this._canvas.setActiveObject(currentObject);
                this.setToolbar(TOOLBAR.SELECTION, true);
            }
            this.autoSave();
        }
    }

    setMouseXY(options) {
        let pnt = this._canvas.getPointer(options.e);
        if (this.mousePos.isDown) {
            this.mousePos.downX = pnt.x;
            this.mousePos.downY = pnt.y;
            this.mousePos.movementX = -1;
            this.mousePos.movementY = -1;
            this.mousePos.upX = -1;
            this.mousePos.upY = -1;
        } else { // is mouse up
            this.mousePos.upX = pnt.x;
            this.mousePos.upY = pnt.y;
            this.mousePos.movementX = Math.abs(this.mousePos.downX - this.mousePos.upX);
            this.mousePos.movementY = Math.abs(this.mousePos.downY - this.mousePos.upY);
        }
    }

    setTopLeft(options) {
        options.top = Math.min(this.mousePos.downY, this.mousePos.upY);
        options.left = Math.min(this.mousePos.downX, this.mousePos.upX);
    }

    autoSave() {
        if (this.fireAutoSave && !this._loadingCanvas) {
            this.dispatchEvent(
                new CustomEvent('autosavecanvas')
            );
        }
    }

    /* === ===
     * Toolbar functions
     */
    setToolbar(setting, resetMenuItems) {
        if (resetMenuItems) {
            this.clearSelectedMenuItems();
        }
        this.turnOffActiveToolbar();
        this.toggleSelectable(setting === TOOLBAR.SELECTION);
        this._canvas.discardActiveObject().renderAll();

        this.currentToolbar = setting;

        this._canvas.isDrawingMode = setting === TOOLBAR.DRAWING;

        this._canvas.selection = true;

        if (setting === TOOLBAR.SELECTION) {
            this.selected.select = true;
        } else if (setting === TOOLBAR.DRAWING) {
            this.selected.drawing = true;
            this._canvas.freeDrawingBrush.color = this._lineColor;
            this._canvas.freeDrawingBrush.width = this._lineWidth;
        } else if (setting === TOOLBAR.TEXT) {
            this.selected.text = true;
        } else if (setting === TOOLBAR.SHAPES) {
            this.selected.shapes = true;
        } else if (setting === TOOLBAR.STAMPS) {
            this.selected.stamps = true;
        }
    }
    turnOffActiveToolbar() {
        for (let setting in this.selected) {
            if (this.selected.hasOwnProperty(setting)) {
                this.selected[setting] = false;
            }
        }
    }
    toggleSelectable(setting) {
        let objs = this._canvas.getObjects();
        for (let i = 0; i < objs.length; i++) {
            objs[i].selectable = setting;
        }
    }
    clearSelectedMenuItems() {
        for (let i = 0; i < this.shapes.length; i++) {
            this.shapes[i].checked = false;
        }
        for (let i = 0; i < this.stamps.length; i++) {
            this.stamps[i].checked = false;
        }
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
    /*showMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                "title": title,
                "message": message,
                "variant": variant,
                "mode": "dismissable",
            }),
        );
    }*/
}