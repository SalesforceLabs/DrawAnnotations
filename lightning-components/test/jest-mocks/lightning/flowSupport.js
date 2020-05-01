const FlowAttributeChangeEventName = 'lightning__flowattributechange';

export class FlowAttributeChangeEvent extends CustomEvent {
    constructor(propertyName, value) {
        super(FlowAttributeChangeEventName, {
            composed: true,
            cancelable: true,
            bubbles: true,
        });
    }
}