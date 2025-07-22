export const calcAge = (birthDate) => {
    const birthYear = new Date(birthDate).getFullYear()
    const currentYear = new Date().getFullYear()
    return currentYear - birthYear + 1
}