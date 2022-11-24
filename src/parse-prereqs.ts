import { CoursesRequirement, ReqType } from "./models/course-requirement.model";

enum States {
	Any, // Expecting the word to represent anything (course, part of sub-req, other)
	Separator, // Expecting the word to represent a separator for requirements ("or", "and")
	Course, // Excpecting the word to represent a course
	End, // We have reached the end of the word array
}

function isCourse(text: string): boolean {
	return text.includes('-');
}

// Note: assumes the text is lowercase
function isSeparator(text: string): boolean {
	if (text.includes('and') || text.includes('or') || text.includes('both') || text.includes('either') || text.includes(',')) {
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

function mainBranch(words: string[]): CoursesRequirement {

	const prereqs: CoursesRequirement = new CoursesRequirement();

	return prereqs;
}

class processSubPrereqContainer {
	public prereq: CoursesRequirement;
	public offset: number;
}

/*
	this function will process the sub-prereq
	it will iterate through the words array for the data to do so
*/
function processSubPrereq(words: string[]): processSubPrereqContainer {
	// console.log(words);
	const container: processSubPrereqContainer = new processSubPrereqContainer();
	const prereq: CoursesRequirement = new CoursesRequirement();

	container.offset = 2;

	// the first word should indicate the type of this sub-prereq
	const firstWord: string = words[0].toLowerCase();
	prereq.setType(getPrereqType(firstWord));
	
	// we know that upon the first iteration, the previous state was a separator and the current state is a separator
	let currentState: States = States.Any;
	let pastState: States = States.Any;
	let nextState: States = States.Any;

	for (let i = 1; i < words.length; i++) { // start at second word
		const word = words[i].toLowerCase();

		// store the previous state
		pastState = currentState;

		// update the current state
		currentState = nextState;

		// find the next state
		if (i + 1 >= words.length) { // End state
			nextState = States.End;
		} else { // we know that there is a next word (isn't null)
			const nextWord = words[i+1].toLowerCase();
			if (isSeparator(nextWord)) { // if the next word represents a separator
				nextState = States.Separator;
			} else if (isCourse(nextWord)) { // if the next word represents a course
				nextState = States.Course;
			} else { // word can be anything
				nextState = States.Any;
			}
		}

		container.offset++;

		// if we have back to back separator states, then we are done processing for this sub-prereq
		if (nextState == States.Separator && currentState == States.Separator) {
			break;
			// return prereq;
		} else if (currentState == States.Course) {
			prereq.addCourse(word);
		} else if (currentState == States.Any) {
			if (isCourse(word)) {
				prereq.addCourse(word);
			} else {
				prereq.setExtra(prereq.extra + ' ' + word);
			}
		}

		// if (isCourse(word)) {
		// 	prereq.addCourse(word);
		// } else {
		// 	prereq.setExtra(prereq.extra + ' ' + word);
		// }

	}
	
	container.prereq = prereq;

	return container;
}

function processPrereqWords(words: string[]): CoursesRequirement {
	const prereqs: CoursesRequirement = new CoursesRequirement();
	prereqs.setType(ReqType.None);
	
	let currentState: States = States.Any;
	let pastState: States = null;
	let nextState: States = States.Any;

	// split up the current word array into multiple sub arrays
	// each sub array will be converted to a CourseRequirement
	// and then added to this prereq
	let subReqs: string[][] = [];

	for (let i = 0; i < words.length; i++) {
		const word = words.at(i).toLowerCase();
		if (word.length < 1) {
			continue;
		}

		// store the previous state
		pastState = currentState;

		// update the current state
		currentState = nextState;

		// find the next state
		if (i + 1 >= words.length) { // End state
			nextState = States.End;
		} else { // we know that there is a next word (isn't null)
			const nextWord = words[i+1].toLowerCase();
			if (isSeparator(nextWord)) { // if the next word represents a separator
				nextState = States.Separator;
			} else if (isCourse(nextWord)) { // if the next word represents a course
				nextState = States.Course;
			} else { // word can be anything
				nextState = States.Any;
			}
		}


		// if this state is a separator and the previous state is a separator, then
		// we should start a new sub-prereq
		// the prereq ends when there is once again two back to back separators
		if (nextState == States.Separator && currentState == States.Separator) {
			prereqs.setType(getPrereqType(word));
			const prereqContainer: processSubPrereqContainer = processSubPrereq(words.slice(i+1));
			i += prereqContainer.offset;
			// console.log(`Moving i to: ${i}`);
			prereqs.addReq(prereqContainer.prereq);
			break;
		} else if (currentState == States.Course) {
			prereqs.addCourse(word);
		} else if (currentState == States.Any) {
			if (isCourse(word)) {
				prereqs.addCourse(word);
			} else {
				prereqs.setExtra(prereqs.extra + ' ' + word);
			}
		} else if (currentState == States.Separator) {
			prereqs.setType(getPrereqType(word));
		}

	}

	if (prereqs.type == ReqType.None) {
		prereqs.setType(ReqType.All);
	}
	
	prereqs.setExtra(prereqs.extra.replace(' ', ''));


	return prereqs;
}

export function ParsePrereqs(text: string): CoursesRequirement {
	// const prereqs: CoursesRequirement = new CoursesRequirement();
	let procText: string = text;
	if (text.charAt(0) == ' ') {
		procText = text.slice(1);
	}
	let words: string[] = [];
	let bufText: string = '';
	for (let i = 0; i < procText.length; i++) {
		const indexChar: string = procText.charAt(i);
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