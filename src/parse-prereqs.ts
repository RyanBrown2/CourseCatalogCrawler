import { CoursesRequirement, ReqType } from "./models/course-requirement.model";

enum States {
    Any, // Expecting the word to represent anything (course, part of sub-req, other)
    Separator, // Expecting the word to represent a separator for requirements ("or", "and")
}

function isCourse(text: string): boolean {
    return text.includes('-');
}

function isSeparator(text: string): boolean {
    if (text.toLowerCase() == 'and' || text.toLowerCase() == 'or' || text == ',') {
        return true;
    }
    return false;
}

// based on the given word, should a new sub-prereq be started
function checkNewPrereq(text: string): boolean {

    return false;
}

function findNextComma(words: string[], startIndex: number): number {
    return words.findIndex((w, i) => i >= startIndex && w ==',');
}

function getPrereqType(text: string): ReqType {
    if (text.toLowerCase().includes('or') || text.toLowerCase().includes('either')) {
        return ReqType.Any;
    } else if (text.toLowerCase().includes('and') || text.toLowerCase().includes('both')) {
        return ReqType.All;
    } else {
        return ReqType.None;
    }
}

function processPrereqWords(words: string[]): CoursesRequirement {
    const prereqs: CoursesRequirement = new CoursesRequirement();
    prereqs.setType(ReqType.None);
    
    let state: States = States.Any;
    for (let i = 0; i < words.length; i++) {
        let word = words[i].toLowerCase();
        
        if (state == States.Any) {
            if (isCourse(word)) {
                prereqs.addCourse(word);
                state = States.Separator; // the next word is expected to be a separator
                continue;
            } else if (word.includes('both') || word.includes('either')) {
                // prereqs.setType(getPrereqType(word));

                let endReq: number = findNextComma(words, i+1); // this is the index of the next comma, which is where a new sub-req will begin

                let newReqWords: string[] = [];
                if (endReq == -1) {
                    newReqWords = words.slice(i+2, words.length);
                    i = words.length;
                } else {
                    newReqWords = words.slice(i+2, endReq-1);
                    i = endReq;
                }

                prereqs.addReq(processPrereqWords(newReqWords));

                state = States.Any;

                continue;
            } else if (isSeparator(word)) {
                prereqs.setType(getPrereqType(word));
                continue;
            } else { // If not anything, then it is likely apart of the extra
                prereqs.setExtra(prereqs.extra + ' ' + word);
                continue;
            }
        } else if (state == States.Separator) {
            if (!isSeparator(word)) {
                console.warn(`Not a separator: ${word}`);
                continue;
            }

            if (word.toLowerCase() == 'and') {
                prereqs.setType(ReqType.All);
                state = States.Any;
            } else if (word.toLowerCase() == 'or') {
                prereqs.setType(ReqType.Any);
                state = States.Any;
            } else if (word == ',') { // this indicates a new sub-req
                prereqs.setType(getPrereqType(words[i+1]))
                let endReq: number = findNextComma(words, i+1); // this is the index of the next comma, which is where a new sub-req will begin

                let newReqWords: string[] = [];
                if (endReq == -1) {
                    newReqWords = words.slice(i+2, words.length);
                    i = words.length;
                } else {
                    newReqWords = words.slice(i+2, endReq-1);
                    i = endReq;
                }

                prereqs.addReq(processPrereqWords(newReqWords));

                state = States.Any;

                // TODO handle sub-reqs

            }

            state = States.Any;
            
        }

    }

    if (prereqs.type == ReqType.None) {
        // prereqs.setType(ReqType.All);
    }
    
    prereqs.setExtra(prereqs.extra.replace(' ', ''));

    return prereqs;
}

export function ParsePrereqs(text: string): CoursesRequirement {
    // const prereqs: CoursesRequirement = new CoursesRequirement();

    let words: string[] = [];
    let bufText: string = '';
    for (let i = 0; i < text.length; i++) {
        const indexChar: string = text.charAt(i);
        if (indexChar == ' ') { // New word
            words.push(bufText);
            bufText = '';
            continue;
        } else {
            bufText += indexChar;
        }
    }


    // for (let i = 0; i < words.length; i++) {

    // }

    const prereqs: CoursesRequirement = processPrereqWords(words);

    return prereqs;
}