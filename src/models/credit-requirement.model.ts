import { Deserializable } from "./deserializable.model";

export class CreditRequirement implements Deserializable {
	
	// constructor() {}

	public name: string = '';
	public amount: number = 0;

	public subjects: string[] = []; // the course subjects that are included
	public inclusions: string[] = [];
	public exclusions: string[] = [];

	deserialize(input: any): this {
		return Object.assign(this, input);
	}
	
}