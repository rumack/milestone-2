import * as barChart from '../js/charts/bar-chart.js';
import * as lineChart from '../js/charts/line-chart.js';
import * as pieChart from '../js/charts/pie-chart.js';

/*------------ A suite of 26 automatic tests for the updateable charts (barchart, linechart and piechart -------------*/

describe('bar, line, and pie charts', function() {
    // create containers for the charts and render them invisible (so as not to display in the SpecRunner.html)
    const chartBar = d3.select('body').append('div').attr('class', 'bar-chart').style('display', 'none');
    const chartLine = d3.select('body').append('div').attr('class', 'line-chart').style('display', 'none');
    const chartPie = d3.select('body').append('div').attr('class', 'pie-chart').style('display', 'none');

    d3.json('../data/ni-elections.json', function(data) {
        // instantiate charts
        barChart.renderChart(data, 450, 375, '.bar-chart', '2019');
        lineChart.renderChart(data, 450, 375, '.line-chart');
        pieChart.renderChart(data, 450, 375, '.pie-chart');


        // Test for creation of svgs with correct class names
        describe('chart svgs', function() {
            it('should create SVGs with appropriate class for bar, line and pie charts', function() {
                expect(getSVG(chartBar).attr('class')).toBe('svg--bar');
                expect(getSVG(chartLine).attr('class')).toBe('svg--line');
                expect(getSVG(chartPie).attr('class')).toBe('svg--pie');
            }) 
        })

        // Test for creation of the chart titles
        describe('all chart titles', () => {
            it('should create titles with the class of "title" for bar, line and pie charts', () => {
                expect(getTitle(chartBar).attr('class')).toBe('title title-barchart');
                expect(getTitle(chartLine).attr('class')).toBe('title title-linechart');
                expect(getTitle(chartPie).attr('class')).toBe('title title-piechart');
            })
        })

        // Test for creation of the tooltips (bar and line charts)
        describe('bar and line chart tooltips', () => {
            it('should create a div for the tooltips with the appropriate class for bar and line charts', () => {
                expect(getTooltip(chartBar).attr('class')).toBe('tooltip barchart--tooltip');
                expect(getTooltip(chartLine).attr('class')).toBe('tooltip linechart--tooltip');
            })
        })

        // Test for creation of the correct number of bars in the bar chart
        describe('barchart bars', () => {
            it('should create 6 bars with the class of "bar"', () => {
                expect(getBars(chartBar).size()).toBe(6);
                
            })
        })

        // Test for creation of the correct number of lines and circles in the line chart
        describe('line-chart lines and circles', () => {
            it('should create 6 lines (with class "line") and 36 circles with the class of "circle"', () => {
                expect(getLines(chartLine).size()).toBe(6);
                expect(getCircles(chartLine).size()).toBe(36);
                
            })
        })

        // Test for creation of the 'body' group in bar, line and pie charts, and check for their correct translation
        describe('all charts body svg group', () => {
            it('should create a "body" group in each chart and correctly translate it', () => {
                expect(getBody(chartBar)).toBeDefined();
                expect(getBody(chartLine)).toBeDefined();
                expect(getBody(chartPie)).toBeDefined();
                expect(getBody(chartBar).attr('transform')).toBe('translate(100, 100)');
                expect(getBody(chartLine).attr('transform')).toBe('translate(100, 100)');
                // Pie chart group is not translated 
            })
        })

        // Test for creation of the y labels in line and bar charts
        describe('The y labels in line and bar charts', () => {
            it('should create a y label (with class "label y") in both the line and bar charts', () => {
                expect(getYLabels(chartLine)).toBeDefined();
                expect(getYLabels(chartBar)).toBeDefined(); 
            })
        })

        // Test for creation of vertical and horizontal axes in the line and bar charts
        describe('The axes lines in bar and line charts', () => {
            it('should create vertical and horizontal axis lines in the bar and line charts', () => {
                expect(getAxisLines(chartLine).size()).toBe(4);
                expect(getAxisLines(chartBar).size()).toBe(2);
            })
        })

        // Test for creation of radio buttons and labels in the bar charts
        describe('The radio buttons in bar charts', () => {
            it('should create 6 radio buttons, one for every election year', () => {
                expect(getRadioBtns(chartBar).size()).toBe(6);
                expect(getRadioBtnLabels(chartBar).size()).toBe(6);
            })
        })

         // Test for creation of dropdown select menu and its 7 options in line charts
        describe('The dropdown select menu in line charts', () => {
            it('should create a dropdown select menu with 7 options', () => {
                expect(getDropDownMenu(chartLine)).toBeDefined();
                expect(getDropDownMenuOptions(chartLine).size()).toBe(7);
            })
        })

        // Test for creation of piechart legend: 2 rects and 2 texts
        describe('The piechart legend', () => {
            it('should create a legend consisting of 2 rects and 2 texts', () => {
                expect(getPieLegendRects(chartPie).size()).toBe(2);
                expect(getPieLegendTexts(chartPie).size()).toBe(2);
            })
        })

        // Removing container upon completion of tests
        d3.selectAll('div.bar-chart').remove();
        d3.selectAll('div.line-chart').remove();
        d3.selectAll('div.pie-chart').remove();
    })


    // Utility selection functions

    function getSVG(chart) {
        return chart.select('svg');
    } 

    function getTitle(chart) {
        return chart.select('text.title');
    }

    function getTooltip(chart) {
        return chart.select('div.tooltip');
    }

    function getBars(chart) {
        return chart.selectAll('rect.bar');
    }

    function getLines(chart) {
        return chart.selectAll('path.line_party');
    }

    function getCircles(chart) {
        return chart.selectAll('circle.dot');
    }

    function getBody(chart) {
        return chart.select('g.body');
    }

    function getYLabels(chart) {
        return chart.select('text.label.y');
    }

    function getAxisLines(chart) {
        return chart.selectAll('g.axis path.domain');
    }

    function getRadioBtns(chart) {
        return chart.selectAll('.barchart-radio-btn');
    }

    function getRadioBtnLabels(chart) {
        return chart.selectAll('.barchart-label');
    }

    function getDropDownMenu(chart) {
        return chart.select('select.linechart-select-menu');
    }

    function getDropDownMenuOptions(chart) {
        return chart.selectAll('select.linechart-select-menu option');
    }

    function getPieLegendRects(chart) {
        return chart.selectAll('.legend');
    }

    function getPieLegendTexts(chart) {
        return chart.selectAll('.legend-text');
    }
})








