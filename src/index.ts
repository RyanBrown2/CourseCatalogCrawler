import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import axios, { AxiosError } from 'axios';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
// import { Crawler } from 'crawler';
import Crawler from "Crawler";

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

import { Course } from './models/course.model';
import { DataExtract } from './data-extract';

async function fetchFromWebOrCache(url: string, ignoreCache = false) {
	// If the cache folder doesn't exist, create it
	if (!existsSync(resolve(__dirname, '.cache'))) {
		mkdirSync('.cache');
	}
	console.log(`Getting data for ${url}...`);
	if (
		!ignoreCache &&
		existsSync(
			resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
		)
	) {
		console.log(`I read ${url} from cache`);
		const HTMLData = await readFile(
			resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
			{ encoding: 'utf8' },
		);
		const dom = new JSDOM(HTMLData);
		return dom.window.document;
	} else {
		console.log(`I fetched ${url} fresh`);
		const HTMLData = await fetchPage(url);
		if (!ignoreCache && HTMLData) {
			writeFile(
			resolve(
				__dirname,
				`.cache/${Buffer.from(url).toString('base64')}.html`,
			),
			HTMLData,
			{ encoding: 'utf8' },
			);
		}
		return HTMLData;
	}
}

function fetchPage(url: string): Promise<string | undefined> {
	const HTMLData = axios
		.get(url)
		.then(res => res.data)
		.catch((error: AxiosError) => {
			console.error(`There was an error with ${error.config.url}.`);
			console.error(error.toJSON());
		});
	
	return HTMLData;
}

const credentialsRaw: Buffer = fs.readFileSync('credentials.json');
const serviceAccount = JSON.parse(credentialsRaw.toString());

// const serviceAccount = require('./credentials.json');


initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const courseCollection = db.collection('CourseData2');

const dataExtract: DataExtract = new DataExtract();

var c: Crawler = new Crawler({
    maxConnections: 10,
    rateLimit: 100,
    callback: function(err, res, done) {

        if (res.$("title").text().includes("404")) {
            done();
            return;
        }

        const dom = new JSDOM(res.body);

        // console.log("Valid Course");

        const course: Course = dataExtract.extractCourse(dom);

        const doc = courseCollection.doc(`${course.subject}-${course.number}`);

		// doc.set({'data': JSON.stringify(course)});

        doc.set({
            'id': `${course.subject}-${course.number}`,
            'subject': course.subject,
            'number': course.number,
            'title': course.title,
            'description': course.description,
            'prereqs': JSON.stringify(course.prereqs),
            'prereqsText': course.prereqsText,
            'searchText': course.searchText
        });

        console.log(`Written ${doc.id}`);

        done();
    }
});


const coursePathsRaw: Buffer = fs.readFileSync("paths.json");
const coursePaths = JSON.parse(coursePathsRaw.toString());

const mainURL = coursePaths.main;

for (var subject of coursePaths.subjects) {
    if (!subject.run) {
        continue;
    }
    console.log(`Starting: ${subject.title}`);
    for (var course of subject.courses) {
        const url = `${mainURL}${subject.subDir}${subject.prefix}-${course}.html`;
        c.queue(url);
        // console.log(url);
    }
}
