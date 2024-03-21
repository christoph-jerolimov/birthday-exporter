import fs from 'fs';
import vcf from 'vcf';
import * as ics from 'ics';
import type { EventAttributes } from 'ics';

const inputFilename = '/home/christoph/Downloads/contacts.vcf';
const outputFilename = '/home/christoph/Downloads/birthdays.ics';

const inputString = fs.readFileSync(inputFilename, 'utf-8')

// console.log(inputString);

const cards = vcf.parse(inputString);
const prefix = "Geburtstag ";
const suffix = "";
const events: EventAttributes[] = [];

console.log('Cards:', cards.length);

cards.forEach((card, index) => {
  const name = card.get('fn')?.valueOf()?.toString() || card.get('n')?.valueOf()?.toString();
  const bday = card.get('bday')?.valueOf()?.toString();
  if (!name) {
    // console.log('Card', index, 'has no name');
  } else if (!bday) {
    // console.log('Card', index, 'has no bday:', name);
  } else if (bday.match(/^(19\d\d|20[0-2]\d)[0-1]\d[0-3]\d$/)) {
    // console.log('Card', index, 'complete date format:', bday);
    const year = parseInt(bday.substring(0, 4));
    const month = parseInt(bday.substring(4, 6));
    const day = parseInt(bday.substring(6, 8));
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + 1);
    events.push({
      title: `${prefix}${name}${suffix}`,
      start: [start.getFullYear(), start.getMonth() + 1, start.getDate()],
      end: [end.getFullYear(), end.getMonth() + 1, end.getDate()],
      recurrenceRule: 'FREQ=YEARLY',
      busyStatus: 'FREE',
    });
  } else if (bday.match(/^--[0-1]\d[0-3]\d$/)) {
    // console.log('Card', index, 'day and month only format:', bday);
    const month = parseInt(bday.substring(2, 4));
    const day = parseInt(bday.substring(4, 6));
    const start = new Date(new Date().getFullYear(), month - 1, day);
    const end = new Date(new Date().getFullYear(), month - 1, day + 1);
    events.push({
      title: `${prefix}${name}${suffix}`,
      start: [start.getFullYear(), start.getMonth() + 1, start.getDate()],
      end: [end.getFullYear(), end.getMonth() + 1, end.getDate()],
      recurrenceRule: 'FREQ=YEARLY',
      busyStatus: 'FREE',
    });
  } else {
    console.log('Card', index, 'has unexpected date format:', bday);
  }
});

// console.log('Events:', events);

const { value: calenderString, error: createEventError } = ics.createEvents(events);

if (createEventError) {
  console.error('Error creating events:', createEventError);
} else if (calenderString) {
  fs.writeFileSync(outputFilename, calenderString, 'utf-8');
  console.log('Wrote', events.length, 'birthdays to', outputFilename);
}
