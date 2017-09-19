import { FormProperty } from './formproperty';
export declare abstract class AtomicProperty extends FormProperty {
    setValue(value: any, onlySelf?: boolean): void;
    reset(value?: any, onlySelf?: boolean): void;
    resetValue(value: any): any;
    hasValue(): boolean;
    abstract fallbackValue(): any;
    _updateValue(): void;
}
