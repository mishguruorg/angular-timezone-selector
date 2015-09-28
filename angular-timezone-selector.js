/*global angular, _, moment, $*/

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
  .factory('timezones', ['_', 'moment', function (_, moment) {
    var timezoneMap = {}
    _.forEach(moment.tz.names(), function (zoneName) {
      var tz=moment.tz(zoneName);
      timezoneMap[zoneName] = {
        id: zoneName,
        name: zoneName.replace(/_/g, ' '),
        offset: 'UTC' + tz.format('Z'),
        nOffset: tz.utcOffset()
      }
    })
    return timezoneMap
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

  .directive('timezoneSelector', ['_', 'timezones', 'zoneToCC', 'CCToCountryName', function (_, timezones, zoneToCC, CCToCountryName) {
    return {
      restrict: 'E',
      replace: true,
      template: '<select style="min-width:300px;"></select>',
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
            children: zonesByCountry,
            firstNOffset: zonesByCountry[0].nOffset
          }

          data.push(zonesForCountry)
        })

        // Sort by UTC or country name
        if (attrs.sortBy=="offset"){
            data = _.sortBy(data, 'firstNOffset');
            _.forEach(data,function(zonesForCountry,key){
                zonesForCountry.children=_.sortBy(zonesForCountry.children, 'nOffset');
            });
        } else {
            data = _.sortBy(data, 'text')
        }

        // add initial options forlocal
        if (attrs.showLocal!=undefined){
            if (jstz!=undefined){
                var extraTZs = _.where(timezones,{'name':jstz.determine().name() });
            } else {
                var localUTC = 'UTC'+moment().format('Z');
                var extraTZs = _.where(timezones,{'offset':localUTC});
            }
            data.splice(0,0,{
              text: 'Local' + ': ',
              children: extraTZs,
              firstNOffset: extraTZs[0].nOffset,
              firstOffset: extraTZs[0].offset
          })
        }

        // add initial options
        if (attrs.primaryChoices!=undefined){
            // var primaryChoices=['UTC','GB','WET','GMT','Asia/Macau']
            var primaryChoices = attrs.primaryChoices.split(' ');
            var extraTZs = _.filter(timezones,function(tz){return _.contains(primaryChoices,tz.name)});
            data.splice(0,0,{
              text: 'Primary' + ': ',
              children: extraTZs,
              firstNOffset: extraTZs[0].nOffset,
              firstOffset: extraTZs[0].offset
            })
        }

        // Construct a select box with the timezones grouped by country
        _.forEach(data, function (group) {
          var $optgroup = $('<optgroup label="' + group.text + '">')
          group.children.forEach(function (option) {

            if (attrs.displayUtc=="true" && !option.name.includes('(UTC')){
                option.name = option.name + ' (' + option.offset+')';
            }

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
          no_results_text: 'No results, try searching for the name of your country or nearest major city.',
          placeholder_text_single: 'Choose a timezone'
        })

        // Update the box if ngModel changes
        $scope.$watch('ngModel', function () {
          elem.val($scope.ngModel)
          elem.trigger('chosen:updated')
        })
      }
    }
  }])
