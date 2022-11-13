import { CoursesRequirement } from "./course-requirement.model";
import { Deserializable } from "./deserializable.model";

export class Course implements Deserializable {

	public id: string = '';
    public subject: string = '';
    public number: string = '';
    public title: string = '';
    public description: string = '';
	public prereqs: CoursesRequirement = new CoursesRequirement();
    // public prereqs: string[] = [];
    public prereqsText: string = '';
    public searchText: string = '';

	deserialize(input: any): this {
		return Object.assign(this, input);
	}

	
}