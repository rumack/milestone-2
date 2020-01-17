# NI Elections Dashboard

## Stream two milestone project
## Interactive Frontend Development - Code Institute (Jan 2020)

\
\
\
![](/img/gif_dashboard-min.gif)
<br />
<br />
**Click here to see a working [demo](https://rumack.github.io/milestone-2/).**
<br />
<br />
<br />

## Overview

### What is this application for?

This is a simple, accessible dashboard tool for examining NI voting trends between 2001 and 2019. The application allows users to see and compare results across a range of general elections, from 2001 up to December 2019. The user can explore results nationally or by constituency. The dashboard also displays Brexit referendum results.

### What does it do?

The information is first accessed through a stacked bar chart that displays seat tallies by party and by year. The stacked chart is linked to a map which will highlight the relevant constituencies when the stacked chart is hovered or touched. HTML is dynamically generated to give extra details about seat numbers, constituencies, parties etc.

The user is then encouraged to click on the map to generate a constituency profile, and to update the three lower charts (bar chart: vote share percentage, line chart : vote share trends, pie chart: Brexit result). Clicking on each of the constituencies on the map generates a profile and updates the charts. The charts are interactive and allow the user to filter by election year (bar chart) or by party (voting trends).

### How does it work

All data is stored in the ```/data``` folder. The election data is contained in the ```ni-elections.json``` file, the map data in the ```ireland_norn.json``` file. The JavaScript makes use of modules (a feature new to ES6) in the ```js/charts``` folder to parse the data needed for the charts and then to harnasses **d3.js** to join the data to DOM elements and create the charts. These modules alse handle click, touch and hover events, although some of the more simple events are managed through CSS.

Each module is made up of functions needed to render the chart, although only two functions from each chart ('render' and 'update') are exported to the ```index.js``` controller, so everything is parcelled neatly into an appropriate place.

The bulk of the application is written in vanilla javascript (although making very heavy use of **d3**). For layout and styling, a pure CSS approach is preferred, although the application uses **Sass** to streamline the CSS code. The application is fully responsive to all screen sizes through the use of CSS Grid and Flexbox. 

## Technology Used

### Code

**HTML**, **CSS** and **JavaScript**.

**[Sass](https://sass-lang.com/)** is used for styling and organising CSS stylesheets.

**[d3.js](https://d3js.org/)** or data driven documents, used for joining the data to DOM elements and visualisation.

**[Jasmine](https://jasmine.github.io/index.html)** is used for unit testing.

## Testing 

A suite of 26 unit tests were written to test for the presence and functionality of the updateable charts (bar-charts, line-charts, and pie-charts). To run the tests, see the instructions below.

The stacked chart and map were tested manually as they are primarily visual in nature. The application is both complex and simple at the same time. There are 18 constituencies and 6 election years so manually testing these elements (clicking, hovering, touching etc) takes only a few minutes.

The use of Jasmine and unit testing generally has been a real eye-opener. It's helped to understand how to write more maintainable and accessible code, and plans are in place for a complete refactoring of the code with a more thorough, complex and complete suite of unit tests.

### Getting the code up and running

## The application

Clone the directory:

`git clone https://github.com/rumack/milestone-2.git`

In a terminal, change to the ```/milestone-2``` directory:

`cd path/to/milestone-2`

Install dependencies:

`npm install`

Start live server and open ```index.html``` in your browser of choice (the http server is necessary because of the asynchronous json call needed to obtian the data from the data folder):

`npm start`

## The unit testing

Because of the asynchronous nature of the d3.json call, testing also must be conducted over a http server. When the live server is running the application, simply add `/SpecRunner.html` to the url to see test results. The tests are in the ```/spec/chartsSpec.js``` file.

### Data

The election data comes from a range of sources:

[ARK NI elections](https://www.ark.ac.uk/elections/) - ARK is a social policy hub at Queens Univeristy, Belfast

[BBC](https://www.bbc.com/news/election/2019)

[CAIN](https://cain.ulster.ac.uk/issues/politics/election/elect.htm)

[Open Data NI /  Sonraí Oscailte TÉ](https://www.opendatani.gov.uk/)

### Developer

RoRo - email: roro at mailbox dot org 

### Resources

D3 is a fantastic resource but pretty hard to wrap your head around, especially for beginning coders. These books, in this order, helped enormously and are highly recommended:

**Interactive Data Visualization for the Web: An Introduction to Designing with D3 - 2nd Edition**, by Scott Murray

**Data Visualization with D3 4.x Cookbook - 2nd Edition**, by Nick Zhu

**D3 for the Impatient: Interactive Graphics for Programmers and Scientists**, by Philipp K. Janert
