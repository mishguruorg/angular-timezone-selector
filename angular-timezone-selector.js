/*global angular, _, moment, $*/
angular.module('angular-timezone-selector', [])
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
  .directive('timezoneSelector', ['_', 'timezones', 'zoneToCC', 'CCToCountryName', function (_, timezones, zoneToCC, CCToCountryName) {
    return {
      restrict: 'E',
      replace: true,
      template: '<select style="min-width:300px;"></select>',
      // require: 'ngModel',
      scope: {
        ngModel: '='
      },
      link: function ($scope, elem, attrs) {
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
          var zonesForCountry = {
            text: CCToCountryName[CC] + ': ',
            children: zonesByCountry
          }

          data.push(zonesForCountry)
        })

        // Construct a select box with the timezones grouped by country
        _.forEach(data, function (group) {
          var $optgroup = $('<optgroup label="' + group.text + '">')
          group.children.forEach(function (option) {
            $optgroup.append('<option value="' + option.id + '">' +
              option.name + '</option>')
          })
          elem.append($optgroup)
        })

        // Initialise the chosen box
        elem.chosen({
          width: '300px',
          include_group_label_in_selected: true,
          search_contains: true,
          no_results_text: 'No results, try searching for the name of your country.'
        })

        // Update the box if ngModel changes
        $scope.$watch('ngModel', function () {
          elem.val($scope.ngModel)
          elem.trigger('chosen:updated')
        })
      }
    }
  }])
