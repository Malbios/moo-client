export class VerbData {
    public reference: string;
    public name: string;
    public code: string[];

    constructor(reference: string, name: string, code: string[]) {
        this.reference = reference;
        this.name = name;
        this.code = code;
    }
}