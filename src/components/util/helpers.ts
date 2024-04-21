export function validateString(value: any, _default: string|undefined = undefined): string {
    if (value === undefined || value === null || value === "") {
        if (_default === undefined) {
            throw new Error("Value not defined");
        }

        return _default;
    }

    return value;
}

export function validateInt(value: any, _default: number|undefined = undefined): number {
    if (value === undefined || value === null || isNaN(value)) {
        if (_default === undefined) {
            throw new Error("Value not defined");
        }

        return _default;
    }

    return parseInt(value);
}
