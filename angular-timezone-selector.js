/*global angular, _, moment, $, jstz*/

/**
 * angular-timezone-selector
 *
 * A simple directive that allows a user to pick their timezone
 *
 * Author:  Ashok Fernandez <ashok@mish.guru>
 * Date:    12/06/2015
 * License: MIT
 */

angular.module('angular-timezone-selector', [])
  .constant('_', _)
  .constant('moment', moment)
  .factory('timezoneFactory', ['_', 'moment', function (_, moment) {
    return {
      get: function () {
        var timezoneMap = {}
        _.forEach(moment.tz.names(), function (zoneName) {
          var tz = moment.tz(zoneName)
          timezoneMap[zoneName] = {
            id: zoneName,
            name: zoneName.replace(/_/g, ' '),
            offset: 'UTC' + tz.format('Z'),
            nOffset: tz.utcOffset()
          }
        })
        return timezoneMap
      }
    }
  }])

  // Timezone name to country codemap
  .factory('zoneToCC', ['_', function (_) {
    // Note: zones is populated with the data from 'data/zone.csv' when this file is built
    var zones = []
    var zoneMap = {}
    _.forEach(zones, function (zone) {
      zoneMap[zone.name] = zone.cca2
    })
    return zoneMap
  }])

  // Country code to country name map
  .factory('CCToCountryName', ['_', function (_) {
    // Note: codes is populated with the data from 'data/cca2_to_country_name.csv' when this file is built
    var codes = []
    var codeMap = {}
    _.forEach(codes, function (code) {
      codeMap[code.cca2] = code.name
    })
    return codeMap
  }])

  .directive('timezoneSelector', ['_', 'moment', 'timezoneFactory', 'zoneToCC', 'CCToCountryName', function (_, moment, timezoneFactory, zoneToCC, CCToCountryName) {
    return {
      restrict: 'E',
      replace: true,
      template: '<select ng-options="item.country.id as item.country.name group by item.text for item in data" style="min-width:300px;"><option value=""></option></select>',
      scope: {
        ngModel: '=',
        translations: '='
      },
      link: function ($scope, elem, attrs) {
        var data = []
        var timezones = timezoneFactory.get()

        // Group the timezones by their country code
        var timezonesGroupedByCC = {}
        _.forEach(timezones, function (timezone) {
          if (_.has(zoneToCC, timezone.id)) {
            var CC = zoneToCC[timezone.id]
            timezonesGroupedByCC[CC] = !timezonesGroupedByCC[CC] ? [] : timezonesGroupedByCC[CC]
            timezonesGroupedByCC[CC].push(timezone)
          }
        })

        // Add the grouped countries to the data array with their country name as the group option
        _.forEach(timezonesGroupedByCC, function (zonesByCountry, CC) {
          _.forEach(zonesByCountry, function (country) {
            data.push({
              text: CCToCountryName[CC] + ': ',
              country: country,
              firstNOffset: zonesByCountry[0].nOffset,
              firstOffset: zonesByCountry[0].offset
            })
          })
        })

        // Sort by UTC or country name
        if (attrs.sortBy === 'offset') {
          data = _.sortBy(data, 'nOffset')
        } else {
          data = _.sortBy(data, 'text')
        }

        // add initial options forlocal
        if (attrs.showLocal !== undefined) {
          if (jstz !== undefined) {
            // Make sure the tz from jstz has underscores replaced with spaces so it matches
            // the format used in timezoneFactory
            var extraTZs = _.filter(timezones, { 'id': jstz.determine().name() })
          } else {
            var localUTC = 'UTC' + moment().format('Z')
            extraTZs = _.filter(timezones, {'offset': localUTC})
          }

          if (extraTZs !== undefined && extraTZs.length > 0) {
            _.forEach(extraTZs, function(extraTZ) {
              data.splice(0, 0, {
                text: _.get($scope, 'translations.local', 'Local') + ': ',
                country: extraTZ,
                firstNOffset: extraTZ.nOffset,
                firstOffset: extraTZ.offset
              })
            })
          }
        }

        if (attrs.setLocal !== undefined) {
          if (jstz !== undefined) {
            $scope.ngModel || ($scope.ngModel = jstz.determine().name())
          }
        }

        // add initial options
        if (attrs.primaryChoices !== undefined) {
          var primaryChoices = []
          _.forEach(attrs.primaryChoices.split(' '), function (choice) {
            primaryChoices.push(choice.replace('_', ' '))
          })
          extraTZs = _.filter(timezones, function (tz) { return _.includes(primaryChoices, tz.name) })

          if (extraTZs !== undefined && extraTZs.length > 0) {
            _.forEach(extraTZs, function(extraTZ) {
              data.splice(0, 0, {
                text: _.get($scope, 'translations.local', 'Local') + ': ',
                country: extraTZ,
                firstNOffset: extraTZ.nOffset,
                firstOffset: extraTZ.offset
              })
            })
          }
        }

        // Annotate the names of the timezones if display UTC is true
        if (attrs.displayUtc === 'true') {
          _.forEach(data, function (item) {
            if (item.country.name.indexOf('(UTC') === -1) {
              item.country.name = item.country.name + ' (' + item.country.offset + ')'
            }
          })
        }

        // Put the data on the scope for access
        $scope.data = data

        // Initialise the chosen box
        elem.chosen({
          width: attrs.width || '300px',
          include_group_label_in_selected: true,
          search_contains: true,
          no_results_text: _.get($scope, 'translations.no_results_text',
              'No results, try searching for the name of your country or nearest major city.'),
          placeholder_text_single: _.get($scope, 'translations.placeholder', 'Choose a timezone')
        })

        // This is a setup function and this is a hack, but it works to fire the setup function once at the right time
        var watch = $scope.$watch('ngModel', setup)

        function setup () {
          elem.val($scope.ngModel)
          elem.trigger('chosen:updated')
          watch()
        }
      }
    }
  }])
