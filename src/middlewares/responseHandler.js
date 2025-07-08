// src/middlewares/responseHandler.js

export const responseHandler = (req, res, next) => {
  // 성공 응답 헬퍼
  res.success = ({ code = 200, message = "요청에 성공했습니다.", result = null }) => {
    return res.status(code).json({
      isSuccess: true,
      code,
      message,
      result,
    });
  };

  next();
};


