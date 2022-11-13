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

		this.handlePrereqs(dom, course);
		return course;
	}

	handlePrereqs(dom: JSDOM, course: Course): CoursesRequirement {
		const prereqElement = dom.window.document.querySelectorAll('.course ul li')[3];
		var textArray = this.innerText(prereqElement);

		course.prereqsText = textArray.join(" ").split(':')[1];

		var finalPrereqs: CoursesRequirement = new CoursesRequirement();

		if (textArray.length==1) {
			return finalPrereqs;
		}

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
