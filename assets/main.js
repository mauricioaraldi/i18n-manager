// Imports
const fs = require('fs');

// Consts
const LOCALES_PATH = 'testLocales';

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
		verifySorting(LOCALES['en-us']);
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
 * @param {Array} localeData Array representation of the locale, to be sorted
 * @param {String} currentKey The current key being sorted in the bigger object
 * @return {String} Message with the sort error encountered
 */
function verifySorting(localeData, currentKey = '') {
	console.log(localeData);
	// let strings = [],
		// objects = [];

	// for (let key in object) {
	// 	let data = object[key];

	// 	if (typeof data == 'string') {
	// 		strings.push(key);
	// 	} else {
	// 		objects.push(key);
	// 		object[key] = verifySorting(data, `${currentKey}${currentKey ? '.' : ''}${key}`);
	// 	}
	// }

	// if (!strings.length && !objects.length) {
	// 	return;
	// }

	// console.log('- - - - - - - -', currentKey, '- - - - - - - -');
	// console.log('Strings', strings);
	// console.log('Objects', objects);
}