export class CustomError extends Error {
    constructor(statusCode, errorCode, message, data = null) {
        super(message)
        this.statusCode = statusCode
        this.errorCode = errorCode
        this.reason = message
        this.data = data
    }
}

// A: Authentication/Authorization (인증/인가) 오류
// C: Client 요청 관련 오류
// S: Server 오류

export class BadRequestError extends CustomError {
    constructor(data = null) {
        super(400, 'C001', '잘못된 요청입니다. 입력값을 확인해주세요.', data)
    }
}

export class UnauthorizedError extends CustomError {
    constructor(data = null) {
        super(401, 'A001', '로그인이 필요한 요청입니다.', data)
    }
}

export class ForbiddenError extends CustomError {
    constructor(data = null) {
        super(403, 'A002', '해당 요청에 대한 권한이 없습니다.', data)
    }
}

export class NotFoundError extends CustomError {
    constructor(message = '요청한 리소스를 찾을 수 없습니다.', data = null) {
        super(404, 'C002', message, data)
    }
}

export class ConflictError extends CustomError {
    constructor(data = null) {
        super(409, 'C003', '요청이 현재 상태와 충돌합니다.', data)
    }
}

export class InternalServerError extends CustomError {
    constructor(data = null) {
        super(
            500,
            'S001',
            '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            data
        )
    }
}

/*
에러 이런식으로 떤지면 됨
if (emailAlreadyExists) {
  throw new ConflictError();
}
*/
