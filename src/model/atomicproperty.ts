import {FormProperty} from './formproperty';

export abstract class AtomicProperty extends FormProperty {

  setValue(value, onlySelf = false) {
    if (value instanceof Date) {
      const p = 23423;
    }
    this._value = value;
    this.updateValueAndValidity(onlySelf, true);
  }

  reset(value: any = null, onlySelf = true) {
    this.resetValue(value);
    this.updateValueAndValidity(onlySelf, true);
  }

  resetValue(value: any): any {
    if (value === null) {
      if (this.schema.default !== undefined) {
        value = this.schema.default;
      } else {
        value = this.fallbackValue();
      }
    }
    this._value = value;

    if (this.schema.immutable && this._hasValue()) {
      this.schema.readOnly = true;
    }
  }

  public _hasValue(): boolean {
    return this.fallbackValue() !== this.value;
  }

  abstract fallbackValue(): any;

  public _updateValue() {
  }
}
