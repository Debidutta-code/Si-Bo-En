export class AppError extends Error {
    status: string;
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${
            statusCode && String(statusCode)[0] === '4' ? 'fail' : 'error'
        }`;
        this.isOperational = true;

        (Error as NodeErrorConstructor).captureStackTrace(
            this,
            this.constructor
        );
    }
}

interface NodeErrorConstructor extends ErrorConstructor {
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
}
