/*global angular, _, moment, $*/
angular.module('angular-timezone-select', [])
  .constant('_', _)
  .constant('moment', moment)
  .factory('timezones', ['_', 'moment', function (_, moment) {
    var timezoneMap = {}
    _.forEach(moment.tz.names(), function (zoneName) {
      timezoneMap[zoneName] = {
        id: zoneName,
        name: zoneName.replace(/_/g, ' '),
        offset: 'UTC' + moment().tz(zoneName).format('Z')
      }
    })
    return timezoneMap
  }])
  .factory('zoneToCC', ['_', function (_) {
    var zones = []
    var zoneMap = {}
    _.forEach(zones, function (zone) {
      zoneMap[zone.name] = zone.cca2
    })
    return zoneMap

  }])
  .factory('CCToCountryName', ['_', function (_) {
    var codes = []
    var codeMap = {}
    _.forEach(codes, function (code) {
      codeMap[code.cca2] = code.name
    })
    return codeMap
  }])
  .directive('timezoneSelect', ['_', 'timezones', 'zoneToCC', 'CCToCountryName', function (_, timezones, zoneToCC, CCToCountryName) {
    return {
      restrict: 'E',
      template: '<input>',
      replace: true,
      link: function (scope, elem, attrs) {
        var data = []

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
          var countryName = CCToCountryName[CC]

          // var searchTerms = countryName.toUpperCase() + ' ' + CC + ' '
          // _.forEach(zonesByCountry, function (zone, key) {
          //   console.log(zone + ' ' + key)
          //   searchTerms += ' ' + zone.id.toUpperCase()
          // })

          var zonesForCountry = {
            text: countryName,
            children: zonesByCountry,
            searchTerms: countryName
          }

          data.push(zonesForCountry)
        })

        elem.select2({
          data: data,
          theme: 'classic',
          formatSelection: function (selection) {
            return selection.id
          },
          formatResult: function (result) {
            if (!result.id) {
              return result.text
            }
            return '<strong>' + result.name + '</strong>  <small>' + result.offset + '</small>'
          },
          matcher: function (params, data) {
            console.log(params)
            console.log(data)
             // If there are no search terms, return all of the data
              if ($.trim(params.term) === '') {
                return data;
              }
             
              // `params.term` should be the term that is used for searching
              // `data.text` is the text that is displayed for the data object
              if (data.text.indexOf(params.term) > -1) {
                var modifiedData = $.extend({}, data, true);
                modifiedData.text += ' (matched)';
             
                // You can return modified objects from here
                // This includes matching the `children` how you want in nested data sets
                return modifiedData;
              }
             
              // Return `null` if the term should not be displayed
              return null;
          }
        })
      }
    }
  }])
