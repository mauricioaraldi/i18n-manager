// Imports
const fs = require('fs');

// Consts
const LOCALES_PATH = 'testLocales';
const IDENTATION_CHARACTER = '	';

// Globals
/**
 * Contains LOCALES as keys, and their value are the content of the locale files,
 * but as an array where each index is a line
 * 
 * @type {Object}
 */
LOCALES = {};

// Body
loadLocales().then(
	result => {
		LOCALES = result;
		drawLoadedLocales(LOCALES);
	},
	error => console.error(error)
);

// Binds
window.onload = () => {
	document.querySelector('#verifySort').addEventListener('click', () => {
		// for (let locale in LOCALES) {
			// verifySorting(LOCALES[locale]);
		// }
		verifySorting(LOCALES['en-us-test']);
	});
};

// Functions
/**
 * Load locales from the locales folder
 *
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @return {Promise<Object>} A promise with loaded locales as array of lines by locale
 */
function loadLocales() {
	let locales = {};

	return new Promise((resolve, reject) => {
		fs.readdir(LOCALES_PATH, (err, files) => {
			if (err) {
				return reject(err);
			}

			let filesLoaded = 0;

			files.forEach(file => {
				fs.readFile(`${LOCALES_PATH}/${file}`, 'UTF-8', (err, data) => {
					if (err) {
						return reject(err);
					}

					let locale = file.slice(0, file.indexOf('.'));

					locales[locale] = data.split(/\n/);

					if (++filesLoaded == files.length) {
						resolve(locales);
					}
				});
			});
		});
	});
}

/**
 * Draws locales in the "loaded locales" section
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Object} locales The locales to be drawn
 */
function drawLoadedLocales(locales) {
	let localesDiv = document.querySelector('#locales > div');

	for (let locale in locales) {
		let button = document.createElement('span');

		button.textContent = locale;
		button.setAttribute('locale', locale);

		localesDiv.appendChild(button);
	}
}

/**
 * Verifies the sorting of the object
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Array} data Array with lines representing the object to be sorted
 * @param {String} currentKey The current key being sorted in the bigger object
 * @return {String} Message with the sort error encountered
 */
function verifySorting(data) {
	let map = {},
		identationOrder = [],
		sortedData;

	data.forEach((line, index) => {
		if (line.indexOf('{') > -1 || line.indexOf(':') > -1) {
			let identationMatches = line.match(new RegExp(IDENTATION_CHARACTER, 'g')),
				key = line.slice(line.indexOf('"') + 1, line.lastIndexOf('"'));

			if (!key) {
				key = '{';
			}

			map[key] = {
				start: index,
				identation: identationMatches ? identationMatches.length : 0
			}

			if (line.indexOf('{') > -1) {
				identationOrder.push(key);
			} else {
				map[key].end = index;
			}
		}

		if (line.indexOf('}') > -1) {
			let key = identationOrder.pop();
			
			map[key].end = index;

			sortedData = sortLinesArray(data, map[key].start + 1, map[key].end);
		}
	});

	printDiff(createLinesArrayDiff(data, sortedData));
}

/**
 * Prints a diff in screen
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Array<String>} diff [description]
 * @return {[type]} [description]
 */
function printDiff(diff) {
	let messageContainer = document.querySelector('#message');

	clearMessageContainer();

	diff.forEach(entry => {
		let entryEl = document.createElement('SPAN');

		entryEl.textContent = entry;

		messageContainer.appendChild(entryEl);
	});
}

/**
 * Removes all content from message container
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 */
function clearMessageContainer() {
	let messageContainer = document.querySelector('#message');

	// Removes all current children from container
	while (messageContainer.firstChild) {
		messageContainer.removeChild(messageContainer.firstChild);
	}
}


/**
 * Creates a diff between two array os lines
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 *
 * @param {Array<String>} base First array to be used in comparison
 * @param {Array<String>} comparison Second array to be used in comparison
 * @return {Array<String>} Array with all the diffs encountered
 */
function createLinesArrayDiff(base, comparison) {
	let numberOfLines = base.length > comparison.length ? base.length : comparison.length,
		diff = [];

	for (let i = 0; i <= numberOfLines; i++) {
		if (base[i] != comparison[i]) {
			diff.push(`Line ${i}:\n[-]${base[i]}\n[+]${comparison[i]}`);
		}
	}

	return diff;
}

/**
 * Sort an array of lines
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 *
 * @param {Array<String>} data The data to be modified (normally the general array, with all lines)
 * @param {Integer} start Index from which to start sorting
 * @param {Integer} end Index untill which to sort
 * 
 * @return {Array} Modified data, sorted from index start to index end
 */
function sortLinesArray(data, start, end) {
	let sortedData = data.slice(),
		dataToSort = data.slice(start, end);

	console.log('to sort', sortedData.toString());

	dataToSort.sort((a, b) => {
		let aKey = a.slice(a.indexOf('"'), a.lastIndexOf('"')),
			bKey = b.slice(b.indexOf('"'), b.lastIndexOf('"')),
			keys = [aKey, bKey];

		keys.sort();

		if (aKey === bKey) {
			return 0;
		}

		if (keys[0] === bKey) {
			return 1;
		}

		if (keys[0] === aKey) {
			return -1;
		}
	});

	for (let i = 0; i < dataToSort.length; i++) {
		sortedData[start + i] = dataToSort[i];
	}

	console.log('sorted', sortedData);

	return sortedData;
}