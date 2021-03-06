# I18n Manager
### Current version: 0.1.0

This project is meant to make easier to manage i18n files that follows a specific pattern which I use in my projects.

Any suggestions to change in pattern or code contributions are welcome.

- - -

In the current pattern, each locale has a JSON file. The filename represents which locale is, like 'en-us', 'pt-br', 'es-ar', etc. The content of the file is separated by each "dictionary" it contains. Currently there are three:

* _Date time_, which contains informations on how the date is normally displayed for that locale;
* _Language_, which will contain the strings to use;
* _Mask_, which contains masks to how some specific numbers are normally shown in that country (telephone, ZIP code, etc.);

Each key can contain an object or a string as value, which can contain another object or string as value and so on. No final key (which contains string as value) should ever be equal to any other key. Then, in the end, it can be something like:

**en-us.json**
```json
{
	"dateTime": {
		"date": "mm/dd/yyyy",
		"time": "hh:mm"
	},
	"language": {
		"general": {
			"cancel": "Cancel",
			"no": "No",
			"yes": "Yes"
		},
		"login": {
			"password": "Password",
			"username": "Username",

			"errors": {
				"wrongUsernameOrPassword": "The entered username or password are wrong"
			}
		},
		"menu": {
			"dashboard": "Dashboard",
			"logout": "Logout"
		}
	},
	"mask": {
		"telephone": "(000) 000 000 000"
	}
}
```

## Disclaimer
This project is licensed under GNU General Public License 3. See LICENSE file for more informations.

No results are guaranteed. Use this software at your own risk.

## Requirements
- Electron 4.0.4

## Contributors
- Mauricio Araldi, [@mauricioaraldi](https://github.com/mauricioaraldi/)
