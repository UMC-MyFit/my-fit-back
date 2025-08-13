import loginModel from './login.model.js'
import { NotFoundError } from '../../middlewares/error.js'
import bcrypt from 'bcrypt'

const loginService = {
    login: async (email, password) => {
        const user = await loginModel.findByEmail(email)
        if (!user) {
            throw new NotFoundError('존재하지 않는 사용자입니다.')
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new NotFoundError('비밀번호가 일치하지 않습니다.')
        }

        const { password: _pw, ...safeUser } = user
        return safeUser


    },

    getUserById: async (id) => {
        return await loginModel.findById(id)
    },
}

export default loginService
