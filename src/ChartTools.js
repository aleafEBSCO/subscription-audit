import * as Highcharts from 'highcharts';
import React from 'react';
import ReactDOM from 'react-dom';
import InfoTable from './InfoTable';
import Utilities from './Utilities';

// Find the count of each subscription type for each fact sheet type
function countSubTypes(subTypes) {
  let subCounts = {};

  for (var i = 0; i < subTypes.length; i += 1) {
    let current = subTypes[i];

    // Initialize fact sheet type field if doesn't exist
    if (!subCounts[current.fs.type]) {
      subCounts[current.fs.type] = [{
          name: 'No responsible, no accountable',
          y: 0
        }, {
          name: 'Responsible, no accountable',
          y: 0
        }, {
          name: 'Accountable, no responsible',
          y: 0
        }, {
          name: 'Responsible and accountable',
          y: 0
        }]
    }
    subCounts[current.fs.type][current.subType].y += 1;
  }
  return subCounts;
}

// Build a pie chart to show responsible/accountable user counts for the given data
function createHighchart(fsType, subTypes, typeNames, data, n) {
  const options = this.buildHighchartsOptions(fsType, subTypes, typeNames, data);
  Highcharts.chart(`chart${n}`, options);
}

// Generate the options for the desired pie chart
function buildHighchartsOptions(fsType, subCount, typeNames, data) {
  var clickInfo = {};

  return {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
        text: typeNames[fsType]
    },
    tooltip: {
      pointFormatter: function() {
        return '<b>Count: ' + Utilities.getRelevantFactSheets(data, fsType, Utilities.subscriptionStringToSubType(this.name)).length + '</b>'
      }
    },
    plotOptions: {
      series: {
        point: {
          events: {
            click: function(event) {
              clickInfo.clickedSubType = this.name;

              // series.events triggers before series.point.events, so both can be accessed here
              let fsType = clickInfo.clickedFsType;
              let subscriptionString = clickInfo.clickedSubType;

              let clickedFsSet = Utilities.getRelevantFactSheets(data, fsType, Utilities.subscriptionStringToSubType(subscriptionString));
              ReactDOM.render(<InfoTable data={clickedFsSet} />, document.getElementById('info'));

              let top = event.pageY;
              $('#info').css('top', `${top + 25}px`);
              
              // Scroll lock
              document.body.style.overflow = 'hidden';
              // Toggle backdrop
              $('#backdrop').toggleClass('modal-backdrop in');
              // Show info
              $('#info').show();
            }
          }
        },
        events: {
          click: function (event) {
            clickInfo.clickedFsType = this.name;
          }
        }
      },
      pie: {
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          }
        }
      }
    },
    series: [{
      name: fsType,
      colorByPoint: true,
      data: subCount
    }]
  }
}

export default {
  countSubTypes: countSubTypes,
  createHighchart: createHighchart,
  buildHighchartsOptions: buildHighchartsOptions
};