// utils/dataTransformer.js

export const convertBigIntsToNumbers = (data) => {
    // 기본 타입 (null, undefined, string, number, boolean) 또는 BigInt 자체는 그대로 반환
    if (data === null || typeof data !== 'object') {
        if (typeof data === 'bigint') {
            return Number(data); // BigInt만 Number로 변환
        }
        return data;
    }

    // 배열인 경우, 각 요소를 재귀적으로 변환
    if (Array.isArray(data)) {
        return data.map(item => convertBigIntsToNumbers(item));
    }

    // 객체인 경우, 각 속성을 재귀적으로 변환
    const newData = {};
    for (const key in data) {
        // hasOwnProperty 체크를 통해 프로토타입 체인에 있는 속성은 스킵
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newData[key] = convertBigIntsToNumbers(data[key]);
        }
    }
    return newData;
};