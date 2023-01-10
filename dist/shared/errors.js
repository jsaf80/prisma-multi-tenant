export class PmtError extends Error {
    type;
    data;
    constructor(type, ...data) {
        super(type);
        this.type = type;
        this.data = data;
    }
}
