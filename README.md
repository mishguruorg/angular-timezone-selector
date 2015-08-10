# Timezone selector for Angular JS

A simple AngularJS directive to create timezone select. It uses [chosen](http://harvesthq.github.io/chosen/) to create auto-complete timezone select. Timezone information comes from [moment](http://momentjs.com/timezone/). Countries timezone data comes from [TimezoneDB](http://timezonedb.com/download).

The user is able to choose their timezone by either typing the name of their country, or the name of the timezone directly.

The angular model that is bound to this directive will be set to the timezone name as used by [moment-timezone](http://momentjs.com/timezone/docs/) i.e `Pacific/Auckland`.

[View Demo](http://mishguruorg.github.io/angular-timezone-selector/)

## Usage

Install using bower

```
bower install angular-timezone-selector
```

Make your Angular module depend on module `angular-timezone-selector`.

```javascript
angular.module('timezoneSelectExample', ['angular-timezone-selector']);
```

Then use directive `timezone-selector`.

```html
<timezone-selector ng-model="timezone">
```

# Attributions
Inspired by [angular-timezone-select](https://github.com/alexcheng1982/angular-timezone-select) from [alexcheng1982](https://github.com/alexcheng1982).

Styled using the examples from [bootstrap-chosen](https://github.com/alxlit/bootstrap-chosen) by [alxlit](https://github.com/alxlit)
