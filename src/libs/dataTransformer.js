// utils/dataTransformer.js
import pkg from 'mecab-ya';
import util from 'util';

const mecab = pkg;
const mecabNounsPromise = util.promisify(mecab.nouns).bind(mecab);

// 영어 단어를 소문자로 변환 and 특수문자 제거
function getEnglishWords(text) {
    return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}


export const convertBigIntsToNumbers = (data) => {
    // 기본 타입 (null, undefined, string, number, boolean) 또는 BigInt 자체는 그대로 반환
    if (data === null || typeof data !== 'object') {
        if (typeof data === 'bigint') {
            return Number(data) // BigInt만 Number로 변환
        }
        return data
    }

    // 날짜 객체는 그대로 반환
    if (data instanceof Date) {
        return data
    }

    // 배열인 경우, 각 요소를 재귀적으로 변환
    if (Array.isArray(data)) {
        return data.map((item) => convertBigIntsToNumbers(item))
    }

    // 객체인 경우, 각 속성을 재귀적으로 변환
    const newData = {}
    for (const key in data) {
        // hasOwnProperty 체크를 통해 프로토타입 체인에 있는 속성은 스킵
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newData[key] = convertBigIntsToNumbers(data[key])
        }
    }
    return newData
}

export const listToString = (list) => {
    const stringResult = list.map(item => item.trim()).join(", ")
    return stringResult
}

export const stringToList = (string) => {
    const listResult = string.split(", ").map(item => item.trim())
    return listResult
}

export const analyzeText = async (text) => {
    try {
        const [koreanNouns, englishWords] = await Promise.all([
            mecabNounsPromise(text), // 한국어 명사 추출 
            Promise.resolve(getEnglishWords(text)) // 영어 단어 추출 
        ]);
        return [...koreanNouns, ...englishWords];
    } catch (error) {
        console.error('키워드 필터링 중 오류 발생:', error);
        return [];
    }
}

export const isKeywordContentSimilar = async (keyword, content) => {
    try {
        ;
        const [keywordTokens, contentTokens] = await Promise.all([
            analyzeText(keyword), // 키워드 분석
            analyzeText(content)  // 내용 분석
        ]);
        return keywordTokens.some(kw =>
            contentTokens.includes(kw)
            // 부분 검색
            //contentTokens.some(contentToken => contentToken.includes(kw))
        );
    } catch (error) {
        console.error('키워드와 내용 비교 중 오류 발생:', error);
        return false;
    }
}
