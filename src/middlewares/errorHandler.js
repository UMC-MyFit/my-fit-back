import { InternalServerError, CustomError } from './error.js'

export const errorHandler = (err, req, res, next) => {
    // 이미 응답이 전송된 후에는 에러 처리 X
    if (res.headersSent) {
        return next(err)
    }

    // CustomError 기반일 경우 해당 에러 코드 및 메시지 응답
    if (err.name === 'CustomError' || err instanceof CustomError) {
        return res.status(err.statusCode).json({
            isSuccess: false,
            code: err.statusCode,
            message: err.reason,
            result: {
                errorCode: err.errorCode,
                data: err.data || null,
            },
        })
    }

    // CustomError가 아닌 경우 기본적으로 500으로 응답
    const fallbackError = new InternalServerError()
    return res.status(fallbackError.statusCode).json({
        isSuccess: false,
        code: fallbackError.statusCode,
        message: fallbackError.reason,
        result: {
            errorCode: fallbackError.errorCode,
            data: null,
        },
    })
}
