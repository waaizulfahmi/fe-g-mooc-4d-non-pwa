export class ApiResponseError extends Error {
    constructor({ data, message }) {
        super();
        this.message = message;
        this.data = data;
    }
}
