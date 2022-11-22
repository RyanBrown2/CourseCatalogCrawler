import { JSDOM } from 'jsdom';

import { Course } from "./models/course.model";
import { CoursesRequirement } from './models/course-requirement.model';

export class DataExtract {
	constructor() { }

	extractCourse(dom: JSDOM): Course {
		const course: Course = new Course();
		
		const titleText: string = dom.window.document.querySelector('.course h3').textContent;
		const splitTitle: string[] = titleText.split(' ');

		course.searchText = titleText;

		course.subject = splitTitle[0].toLowerCase();
		course.number = splitTitle[1];
		course.title = splitTitle.slice(3, splitTitle.length).join(' ');

		course.description = dom.window.document.querySelector('.course p').innerHTML;

		dom.window.document.querySelectorAll('.course ul li')[3].querySelectorAll('a').forEach(e => {
			e.innerHTML = e.innerHTML.split(' ').join('-');
		});

		const prereqElement: Element = dom.window.document.querySelectorAll('.course ul li')[3];
		var textArray = this.innerText(prereqElement);

		course.prereqsText = textArray.join(" ").split(':')[1];
		
		return course;
	}

	handlePrereqs(prereqsText: string): CoursesRequirement {
		const prereqs: CoursesRequirement = new CoursesRequirement();

		let bufText: string = '';
		let beginText: string = '';
		const words: string[] = [];
		for (let i = 0; i < prereqsText.length; i++) {
			const indexChar: string = prereqsText.charAt(i);
			if (indexChar == ' ') { // New word
				beginText = bufText;
				words.push(bufText);
				bufText = '';
				continue;
			}

			bufText += indexChar;
		}


		for (let i = 0; i < words.length; i++) {
			const word: string = words.at(i);

			if (word.includes(',')) {
				const nextWord: string = words.at(i+1);
				if (nextWord == 'and') {
					prereqs.type = 'all';
				}

				if (nextWord == 'or') {
					prereqs.type = 'or';
				}

				const newText: string = words.slice(i+2, words.length-1).join(' ');
				prereqs.addReq(this.handlePrereqs(newText));
				break;
	
			}

			if (word == 'either') {
				prereqs.type = 'or';
				continue;
			}

			if (word == 'or' && prereqs.type=='or') {
				continue;
			}

			if (word.includes('-')) { // if word is a course
				prereqs.addCourse(word);
				continue;

			}

			prereqs.setExtra(prereqs.exta + ' ' + word);

		}

		prereqs.setExtra(prereqs.exta.slice(1, prereqs.exta.length));

		// if (beginText.includes('either'))

		return prereqs;

	}

	innerText(element: HTMLElement|Element): string[] {
		function getTextLoop(element: HTMLElement|Element): string[] {
			const texts: string[] = [];
			Array.from(element.childNodes).forEach((node: HTMLElement) => {
			if (node.nodeType === 3) {
				// texts.push(node.textContent.trim());
				// texts.push(node.textContent.replaceAll(/\s/g,''));
				// texts.push(node.textContent);
				var text;
				if (node.textContent.includes(",")) {
					text = `, ${node.textContent.replace(/^\s+|\s+$|\n|,+\s+/gm,'')}`;
					// text = node.textContent.replace(/^\s+|\s+$|\n|,+\s+/gm,'');
				} else {
					text = node.textContent.replace(/^\s+|\s+$|\n/gm,'')
				}
				// console.log(text);
				texts.push(text);
				// console.log(node.textContent.replace(/^\s+|\s+$|\n/gm,''));
				// texts.push(node.textContent.replace(/^\s+|\s+$|\n/gm,''));
			} else {
				// console.log(node);
				texts.push(...getTextLoop(node));
			}
			});
			return texts;
		}

		const textArray = getTextLoop(element);
		return textArray;
	}

}
