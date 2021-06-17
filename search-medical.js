"use strict";

/*This script will go to the https://apnews.com/, click on the search icon, type "medical", click the expand button in the "STORIES" part, gather all the links in a list, iterate the
list and visit all the links to gather the desired data, finally place that data in a generated JSON file and finally create an HTML from that file. */

//will use fs to create a file with the required data
const fs = require("fs");
const htmlGen = require("./create-table");
const puppeteer = require("puppeteer");

//Puppeteer function that will scrape the data
const medicalSearch = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  //Launch a new page and goto the desired website
  console.log("Visit the apnwes page");
  await page.setViewport({
    width: 1400,
    height: 1060,
  });
  await page.goto("https://apnews.com/");

  //Click on the search button
  await page.click("li.search");

  //Type "medical" in the search input
  console.log("Type 'medical' in the search input");
  await page.type("input[placeholder='Search']", "medical");

  //Close popup that appears in this page
  await page.waitForSelector(".sailthru-overlay .sailthru-overlay-close");
  await page.click(".sailthru-overlay .sailthru-overlay-close");

  //Click on the search button
  await page.click("button>span");

  //Dynamic waits to give time for the page to load
  await page.waitForSelector(".cards .handle");

  //Click the expand button under the "Stories" results from the search
  await page.click(".cards .handle");

  //Extract a list of all the links displayed as results of the search
  const storyLinks = await page.evaluate(() => {
    const elements = document.querySelectorAll(".cards:nth-child(2) a");
    const links = [];

    for (let element of elements) {
      links.push(element.href);
    }
    return links;
  });

  //list that will contain all the objects with the desired data
  let cardsList = [];

  //Iterate over the links list
  for (let link of storyLinks) {
    //Visit the current link
    await page.goto(link);
    await page.waitForSelector(".CardHeadline h1");

    //Collect the info needed from the web page
    const newsInfo = await page.evaluate(() => {
      const tmp = {};
      tmp.headline = document.querySelector(".CardHeadline h1").innerText;
      tmp.author =
        document.querySelector("[class*='Component-by']") !== null
          ? document.querySelector("[class*='Component-by']").innerText
          : "Wasn't able to find the author";
      tmp.date = document.querySelector("[data-key='timestamp']").title;
      tmp.img =
        document.querySelector("[data-key='media-placeholder'] img") !== null
          ? document.querySelector("[data-key='media-placeholder'] img").src
          : "";
      return tmp;
    });
    newsInfo.link = link;
    cardsList.push(newsInfo);
  }

  //I use fs to generate the JSON file using the cardsList as reference
  console.log("Generating JSON file");
  fs.writeFileSync("data.json", JSON.stringify(cardsList));

  await browser.close();

  await htmlGen.createHtmlFile();
};

medicalSearch();
