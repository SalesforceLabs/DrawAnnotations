import { createElement } from 'lwc';
import DrawAnnotationCanvas from 'c/drawAnnotationCanvas';

describe('c-draw-annotation-canvas', () => {
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

    it('Basic creation of canvas from No Context', () => {
        DrawAnnotationCanvas.canvasWidth = 50;
        DrawAnnotationCanvas.canvasHeight = 50;
        DrawAnnotationCanvas.fireAutoSave = false;

        const element = createElement('c-draw-annotation-canvas', {
            is: DrawAnnotationCanvas
        });
        document.body.appendChild(element);

        element.interactionMode(element.stampingMode);
        expect(element.isStampingMode).toBeTruthy();
        element.interactionMode(element.drawingMode);
        expect(element.isDrawingMode).toBeTruthy();
        element.interactionMode(element.fullMode);
        expect(element.isFullMode).toBeTruthy();

        element.currentCanvasValue = "{}";
        expect(element.currentCanvasValue).toBeTruthy();
        expect(element.currentCanvasPng).toBeFalsy();
        element.backgroundImage = "Codey.png";
        expect(element.backgroundImage).toBeTruthy();

        element.interactionMode(element.fullMode);
        element.addStampOption("Burst", "<svg></svg>");
        //expect(element.hasStamps).toBeTruthy();

        //return Promise.resolve().then(() => {
        return flushPromises().then(() => {
            const div = element.shadowRoot.querySelector(".draw-annotation-wrapper");

            expect(div.firstChild).not.toBeNull();
        });
    });
});