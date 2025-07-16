import nodemailer from 'nodemailer'

/**
 * 인증코드 6자리 생성 함수
 */
export function generateAuthCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 인증코드를 이메일로 발송하는 함수
 */
export async function sendAuthCodeEmail(toEmail, authCode) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD,
        },
    })

    const mailOptions = {
        from: `"MyFit 인증" <${process.env.EMAIL_ID}>`,
        to: toEmail,
        subject: 'MyFit 이메일 인증코드',
        html: `
      <div style="font-family: Arial; font-size: 16px;">
        <p>아래 인증번호를 입력해주세요.</p>
        <h2>${authCode}</h2>
      </div>
    `,
    }
    try {
        await transporter.sendMail(mailOptions)
        console.log('메일 전송 성공!!')
    } catch (error) {
        console.log('메일 전송 실패!!:', error)
        throw error
    }
}
