# Timezone select for AngularJS

A simple AngularJS directive to create timezone select. It uses [select2](http://select2.github.io/select2/) to create auto-complete timezone select. Timezone information comes from [moment](http://momentjs.com/timezone/). Countries timezone data comes from [TimezoneDB](http://timezonedb.com/download).

In the dropdown, timezones are divided into three groups:
* __UTC__ - UTC is a common option for most users.
* __Common__ - Timezones for a country
* __Other__ - Other timezones

If the user has already selected the country, timezones for the country will be listed first, which makes easier for user to select.

## Usage

Make your Angular module depend on module `angular-timezone-select`.

```javascript
angular.module('timezoneSelectExample', ['angular-timezone-select']);
```

Then use directive `timezone-select`.

```html
<input timezone-select data-ng-model="timezone" country="country">
```

Attribute `country` can be used to bind user's selected country. Value of selected country should be the [ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code, e.g. `CN`, `US`.

See `example.html` for a simple example.
