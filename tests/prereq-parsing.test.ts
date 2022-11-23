import { CoursesRequirement, ReqType } from '../src/models/course-requirement.model';
import { ParsePrereqs } from '../src/parse-prereqs';

describe('prereq-parsing', function() {

    it('csse-433', function() {
        const prereqText = ` CSSE-333 `;
        
		const prereq: CoursesRequirement = new CoursesRequirement();
        prereq.setType(ReqType.All);
        prereq.addCourse('csse-333');

		const testPreqs: CoursesRequirement = ParsePrereqs(prereqText);
		
		expect(testPreqs).toEqual(prereq);
    });

    it('ma-332', function() {
        const prereqText = ` MA-212 or MA-221 `;
        
		const prereq: CoursesRequirement = new CoursesRequirement();
        prereq.setType(ReqType.Any);
        prereq.addCourse('ma-212');
        prereq.addCourse('ma-221');

		const testPreqs: CoursesRequirement = ParsePrereqs(prereqText);
		
		expect(testPreqs).toEqual(prereq);
    });

    it('ma-336', function() {
        const prereqText =  ` MA-222 or both MA-211 and MA-212 `;
        
		const prereq: CoursesRequirement = new CoursesRequirement();
        prereq.setType(ReqType.Any);
        prereq.addCourse('ma-222');

        const subPrereq: CoursesRequirement = new CoursesRequirement();
        subPrereq.setType(ReqType.All);
        subPrereq.addCourse('ma-221');
        subPrereq.addCourse('ma-212');
        prereq.addReq(subPrereq);

		const testPreqs: CoursesRequirement = ParsePrereqs(prereqText);
		
		expect(testPreqs).toEqual(prereq);
    });

	it('csse-343', function() {
		const prereqText = ' RH-131 , and either CSSE-132 or Senior Class Standing';
		
		const prereq: CoursesRequirement = new CoursesRequirement();
		prereq.type = 'all';
		prereq.addCourse('RH-131');

		const subPrereq: CoursesRequirement = new CoursesRequirement();
		subPrereq.setType('or');
		subPrereq.addCourse('CSSE-132');
		subPrereq.setExtra('Senior Class Standing');
		
		prereq.addReq(subPrereq);
		
		const testPreqs: CoursesRequirement = ParsePrereqs(prereqText);
		
		expect(testPreqs).toEqual(prereq);
	});

    it('ma-416', function() {
        const prereqText = ` Junior standing and either MA212 or MA221 , and either MA223 or MA381 , and one of CHE310 , CSSE220 , ECE230 , MA332 , MA386 or (ME323 or ME327).`;
        
        const prereq: CoursesRequirement = new CoursesRequirement();
        prereq.setType(ReqType.All);
        prereq.setExtra("Junior standing");

        const subPrereq1: CoursesRequirement = new CoursesRequirement();
        subPrereq1.setType(ReqType.Any);
        subPrereq1.addCourse('ma-212');
        subPrereq1.addCourse('ma-221');
        prereq.addReq(subPrereq1);

        const subPrereq2: CoursesRequirement = new CoursesRequirement();
        subPrereq2.setType(ReqType.Any);
        subPrereq2.addCourse('ma-223');
        subPrereq2.addCourse('ma-381');
        prereq.addReq(subPrereq2);

        const subPrereq3: CoursesRequirement = new CoursesRequirement();
        subPrereq3.setType(ReqType.Any);
        subPrereq3.addCourse('che-310');
        subPrereq3.addCourse('csse-220');
        subPrereq3.addCourse('ece-230');
        subPrereq3.addCourse('ma-386');
        subPrereq3.addCourse('me-323');
        subPrereq3.addCourse('me327');
        prereq.addReq(subPrereq3);

		const testPreqs: CoursesRequirement = ParsePrereqs(prereqText);
		
		expect(testPreqs).toEqual(prereq);
    });
});