import _ from 'lodash';
import { DataExtract } from '../src/data-extract';
import { CoursesRequirement } from '../src/models/course-requirement.model';

describe('data-extract', function() {

	let dataExtract: DataExtract;

	beforeEach(() => {
		dataExtract = new DataExtract();
	})

	it('prereqs-csse343', function() {
		const prereqText = " RH-131 , and either CSSE-132 or Senior Class Standing";
		
		const prereq: CoursesRequirement = new CoursesRequirement();
		prereq.type = 'all';
		prereq.addCourse('RH-131');

		const subPrereq: CoursesRequirement = new CoursesRequirement();
		subPrereq.setType('or');
		subPrereq.addCourse('CSSE-132');
		subPrereq.setExtra('Senior Class Standing');
		
		prereq.addReq(subPrereq);
		console.log("Testing Prereqs For CSSE 343");
		
		const testPreqs: CoursesRequirement = dataExtract.handlePrereqs(prereqText);
		
		expect(testPreqs).toEqual(prereq);
	});

});