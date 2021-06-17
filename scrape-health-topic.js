"use strict";

/*This script will go to the https://apnews.com/, click on the Topics dropdown, click on health, gather all the Information required from the different headlines,
place that data in a generate JSON file and finally create an HTML from that file. */

//will use fs to create a file with the required data
const fs = require("fs");
const htmlGen = require("./create-table");
const puppeteer = require("puppeteer");

//Puppeteer function that will scrape the data
const healthTopic = async () => {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    args: ["--window-size=1920,1080"],
  });
  const pages = await browser.pages();
  const page = pages[0];

  //Launch a new page and goto the desired website
  console.log("Visit the apnwes page");
  await page.goto("https://apnews.com/");

  //Click on the Topics dropdown
  await page.click("label.nav-action");

  //Click on the Health topic
  console.log("Click the Health Topic in the Topics Dropdown");
  await page.click("a[href='/hub/health']");

  //Close popup that appears in this page
  await page.waitForSelector(".sailthru-overlay .sailthru-overlay-close");
  await page.click(".sailthru-overlay .sailthru-overlay-close");

  //Dynamic waits to give time for the page to load
  await page.waitForSelector("[data-key='feed-card-wire-story-with-image']");
  await page.waitForSelector("[data-key='media-placeholder'] img");

  //This is a Scroll to the end function, I added it cause the images from the headlines are not displayed (or loaded), until the user scroll over them.
  await autoScroll(page);

  //Extract a list of all the Headlines cards
  const storyCards = await page.$$(
    "[data-key='feed-card-wire-story-with-image']"
  );

  //Create list that will be in charge of storing all the sets of data collected from each headline, one object per headline.
  let cardsList = [];

  //Iterate over the list of Headline cards
  console.log("Collecting the required data");
  for (let card of storyCards) {
    //Extract the exact element in which the headline is located within the Headline card
    let headline = await card.$("[data-key='card-headline'] h3");
    //Extract the text of the element
    let headlineValue =
      headline !== null
        ? await page.evaluate((el) => el.textContent, headline)
        : "";

    //Extract the exact element in which the author is located within the Headline card
    let author = await card.$("[class*='Component-bylines']");
    //Extract the text of the element
    let authorValue =
      author !== null
        ? await page.evaluate((el) => el.textContent, author)
        : "";

    //Extract the exact element in which the link is located within the Headline card
    let link = await card.$("[class*='CardHeadline'] a");
    //Extract the href attribute of the element
    let linkValue =
      link !== null
        ? await page.evaluate((el) => el.getAttribute("href"), link)
        : "";

    //Extract the exact element in which the date is located within the Headline card
    let date = await card.$("[data-key='timestamp']");
    //Extract the title attribute of the element, I extracted the title as in here the complete date was stored
    let dateValue =
      date !== null
        ? await page.evaluate((el) => el.getAttribute("title"), date)
        : "";

    //Extract the exact element in which the image is located within the Headline card
    let img = await card.$("[data-key='media-placeholder'] img");
    //Extract the scr attribute of the element
    let imgValue =
      img !== null
        ? await page.evaluate((el) => el.getAttribute("src"), img)
        : "";
    //Generate the object with the collected data
    let obj = {
      headline: headlineValue,
      author: authorValue,
      link: `https://apnews.com${linkValue}`,
      date: dateValue,
      img: imgValue,
    };
    //Push the object in to our list
    cardsList.push(obj);
  }

  await page.screenshot({ path: "apnews.jpg" });

  //I use fs to generate the JSON file using the cardsList as reference
  console.log("Generating JSON file");
  fs.writeFileSync("data.json", JSON.stringify(cardsList));

  await browser.close();

  //Generates the HTML file that contains the desired data in table form.
  await htmlGen.createHtmlFile();
};

//The auto scroll function that scrolls to end of the page.
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

healthTopic();

module.exports = { healthTopic };
