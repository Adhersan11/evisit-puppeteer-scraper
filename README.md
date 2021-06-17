# evisit-puppeteer-scraper

### Usage: 

#### Step 1

`$ npm install `

#### Step 2

`$ node search-medical.js ` 

or 

`$ node scrape-health-topic.js ` 


### Description:

2 scripts that  scrape data from the website https://apnews.com/. 
- The one called "search-medical.js" will perform a search using the Search input with the "medical" keyword, collect the links that were displayed as result, iterate and visit all of them collecting the required data (headline, author, link to article, date/time posted and any included images) and placing it in a JSON file and finally will create an html file displaying the data. To use it you just need to execute in the terminal the following command: "node search-medical.js" 
- The second one has a different flow, it clicks the "Topics" dropdown, selects the "Health" category, scrolls until the end of the page cause the images are not displayed until they are scrolled into view, collects all the data from the Headlines displayed in that page, placed the data into a JSON file and finally creates the HTML file.  To use it you just need to execute in the terminal the following command: "node scrape-health-topic.js" 

Also at some points in the scripts the website displayed a popup that was handled. 

In addition, if you want to see the execution in your browser (headed), you can just add the headless:false option to the puppeteer.launch command in any of the previous files. I left it headless as default. 
