namespace App {
    export interface Validation {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    }

    export interface Validatable extends Validation {
        value: string | number;
    }

    export function validate(validatable: Validatable) {
        const { value, required, minLength, maxLength, min, max } = validatable;
        
        const isString = typeof value === 'string';
        const isNumber = typeof value === 'number';

        let isValid = true;

        if (required) {
            const valueString = value.toString().trim();

            isValid = isValid && valueString.length > 0;
        }

        if (isString) {
            if (minLength !== undefined) {
                isValid = isValid && value.length >= minLength;
            }
        
            if (maxLength !== undefined) {
                isValid = isValid && value.length <= maxLength;
            }
        }


        if (isNumber) {
            if (min !== undefined) {
                isValid = isValid && value >= min;
            }
        
            if (max !== undefined) {
                isValid = isValid && value <= max;
            }
        }

        return isValid;
    }
}