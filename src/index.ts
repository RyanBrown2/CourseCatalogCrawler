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
