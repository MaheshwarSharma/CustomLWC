import { LightningElement, wire, track } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class AccountCreateModal extends LightningElement {
    @track options = [];
    recordTypeId;
    isOpen = false;

    /* ---------- METADATA ---------- */

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    handleObjectInfo({ data }) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
        }
    }

    @wire(getPicklistValuesByRecordType, {
        objectApiName: ACCOUNT_OBJECT,
        recordTypeId: '$recordTypeId'
    })
    handlePicklistValues({ data }) {
        if (data?.picklistFieldValues?.Services__c) {
            this.options = data.picklistFieldValues.Services__c.values.map(v => ({
                label: v.label,
                value: v.value,
                selected: false
            }));
        }
    }

    /* ---------- GETTERS ---------- */

    get selectedOptions() {
        return this.options.filter(o => o.selected);
    }

    get selectedValuesString() {
        return this.selectedOptions.map(o => o.value).join(';');
    }

    get showPlaceholder() {
        return this.selectedOptions.length === 0;
    }

    get comboboxClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.isOpen ? 'slds-is-open' : ''}`;
    }

    get noOptions() {
        return this.options.length === 0;
    }

    /* ---------- EVENTS ---------- */

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    handleOptionSelect(event) {
        const value = event.currentTarget.dataset.value;
        this.options = this.options.map(o =>
            o.value === value ? { ...o, selected: !o.selected } : o
        );
    }

    handleRemove(event) {
        const value = event.target.name;
        this.options = this.options.map(o =>
            o.value === value ? { ...o, selected: false } : o
        );
    }

    /* ---------- SAVE ---------- */

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Services__c = this.selectedValuesString;

        this.template
            .querySelector('lightning-record-edit-form')
            .submit(fields);
    }

    handleSuccess() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}