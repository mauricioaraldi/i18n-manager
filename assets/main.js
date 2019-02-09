// Imports
const fs = require('fs');

// Consts
const LOCALES_PATH = 'testLocales';
const IDENTATION_STRING = '	';

// Globals
/**
 * Contains LOCALES as keys, and their value are the content of the locale files,
 * but as an array where each index is a line
 * 
 * @type {Object}
 */
LOCALES_AS_TEXT = {};

/**
 * Contains LOCALES as keys, and their value are the content of the locale files,
 * as objects also
 * 
 * @type {Object}
 */
LOCALES_AS_OBJECT = {};

// Body
loadLocales().then(
	result => drawLoadedLocales(LOCALES_AS_OBJECT),
	error => console.error(error)
);

// Binds
window.onload = () => {
	document.querySelector('#verifySort').addEventListener('click', () => {
		// for (let locale in LOCALES) {
			// verifySorting(LOCALES[locale]);
		// }
		let sortedValue = sortObject(LOCALES_AS_OBJECT['en-us-test']),
			diff = createDiffFromMap(sortedValue);

		printDiff(diff);

		document.querySelector('#applySort').classList.remove('hidden');
	});
};

// Functions
/**
 * Creates a diff directly from map
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Map} map The object to generate diff
 * @return {Array<String>} Lines representing the diff
 */
function createDiffFromMap(map) {
	let diff = [];

	for (entry of map) {
		let [key, data] = entry;

		if (typeof data.value === 'object') {
			diff.push(...createDiffFromMap(data.value));
		}

		if (data.previousLine !== data.newLine) {
			diff.push(`Key <span class="diff-key">${key}</span> moved from line ${data.previousLine} to line ${data.newLine}`);
		}
	}

	return diff;
}

/**
 * Get an array of lines from a map
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Map} map The map to be transformed into an array of lines
 * @param {Number} [identation = 1] The indentation to be used in text
 * @return {Array<String>} Lines representing the map
 */
function getLinesArrayFromMap(map, identation = 1) {
	let curObjAsArray = [];

	for (entry of map) {
		let [key, { value }] = entry,
			curIdentation = IDENTATION_STRING.repeat(identation);

		if (typeof value === 'object') {
			value = getLinesArrayFromMap(value, identation + 1);

			curObjAsArray.push(`${curIdentation}${key}: {`);
			curObjAsArray.push(...value);
			curObjAsArray.push(`${curIdentation}},`);
		} else {
			curObjAsArray.push(`${curIdentation}${key}: ${value},`);
		}
	}

	// Removes last comma, because of JSON validity
	curObjAsArray[curObjAsArray.length - 1] = curObjAsArray[curObjAsArray.length - 1].slice(0, -1);

	if (identation === 1) {
		curObjAsArray = ['{'].concat(curObjAsArray).concat(['}']);
	}

	return curObjAsArray;
}

/**
 * Load locales from the locales folder
 *
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @return {Promise<Object>} A promise with loaded locales as array of lines by locale
 */
function loadLocales() {
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

					LOCALES_AS_TEXT[locale] = data.split(/\n/);
					LOCALES_AS_OBJECT[locale] = JSON.parse(data);

					if (++filesLoaded == files.length) {
						resolve(true);
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
 * Sorts an object by key
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Object} data The object to be sorted
 * @param {Integer} parentPosition The line which the parent starts
 * @param {Integer} parentNewPosition The position to which the parent has gonne to
 * @return {Map} The object sorted
 */
function sortObject(data, parentPosition = 1, parentNewPosition = 1) {
	let sortedData = new Map(),
		keys = Object.keys(data),
		previousLinesRecord = {},
		currentLine = parentPosition + 1;

	keys.forEach((key, index) => {
		previousLinesRecord[key] = currentLine;

		if (typeof data[key] === 'object') {
			currentLine += getObjectFullSize(data[key], true);
		} else {
			currentLine++;
		}
	});

	currentLine = parentNewPosition + 1;

	keys.sort().forEach((key, index) => {
		let value = data[key];

		if (typeof value === 'object') {
			value = sortObject(value, previousLinesRecord[key], currentLine);
		}

		sortedData.set(
			key,
			{
				value,
				newLine: currentLine,
				previousLine: previousLinesRecord[key]
			}
		);

		if (typeof value === 'object') {
			currentLine += getObjectFullSize(data[key], true);
		} else {
			currentLine++;
		}
	});

	return sortedData;
}

/**
 * Get the size of an object, taking in account the size of each entry also
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 *
 * @param {Object} object The object to get full size
 * @param {Integer} [countOpeningsAndClosings] Take in account the lines
 * opening and closing brackets
 * @return {Integer} Object full size
 */
function getObjectFullSize(object, countOpeningsAndClosings, isFirstLevel = true) {
	let size = 0;

	for (let key in object) {
		let value = object[key];

		size++;

		if (typeof value === 'object') {
			size += getObjectFullSize(value, countOpeningsAndClosings, false);

			if (countOpeningsAndClosings) {
				size++;
			}
		}
	}

	if (isFirstLevel) {
		size += 2;
	}

	return size;
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

		entryEl.innerHTML = entry;

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
function createLocaleDiff(base, comparison) {
	let numberOfLines = base.length > comparison.length ? base.length : comparison.length,
		diff = [];

	for (let i = 0; i <= numberOfLines; i++) {
		if (base[i] != comparison[i]) {
			diff.push(`Line ${i + 1}:\n[-]${base[i]}\n[+]${comparison[i]}`);
		}
	}

	return diff;
}