import loginModel from './login.model.js'
import { NotFoundError } from '../../middlewares/error.js'
const loginService = {
    login: async (email, password, platform) => {
        const user = await loginModel.findByEmailAndPlatform(email, platform)
        if (!user) {
            throw new NotFoundError('존재하지 않는 사용자입니다.')
        }

        // 추후 bcrypt.compare로 교체 예정
        if (user.password !== password) {
            throw new NotFoundError('비밀번호가 일치하지 않습니다.')
        }

        return user
    },

    getUserById: async (id) => {
        return await loginModel.findById(id)
    },
}

export default loginService
