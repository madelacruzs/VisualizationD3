# VisualizationD3

This project shows the visualization of waiting times and people affected in three different medical care in Canada.

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone URL-this-repository
# Go into the repository
cd Folder-this-repository
# Install dependencies
npm install
# Run the app
npm start
```

## Code Structure

A basic node js application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `app.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `public/index.html` - A web page to render. This is the app's **renderer process**.

Files for Visualization.

- `data/...` - Folder that contains all the data for the Chart
- `data/js/pages/barChar.js` - JavaScript for Bar Chart in "Waiting times per province"
- `data/js/pages/lineChar.js` - JavaScript for Line Chart in "Waiting times per province"
- `data/js/pages/timetrend.js` - JavaScript for Time Trend in "Timetrend"
- `data/js/pages/effects.js` - JavaScript for Pie Chart in "Effects"
- `data/js/pages/index.js` - JavaScript for filters and events in "Waiting times per province"
