import swaggerJSDoc from 'swagger-jsdoc'

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MyFit API',
            version: '1.0.0',
        },
    },
    apis: ['./src/modules/**/*.routes.js'], // 주석이 있는 파일 경로
})

export default swaggerSpec
