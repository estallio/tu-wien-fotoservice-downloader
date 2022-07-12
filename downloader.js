const download = require('download');
const puppeteer = require('puppeteer');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

(async () => {
    // in most of the cases, this is simply the date of the event in the form DDMMYY
    const password = '280622';
    // url of the gallery (url of the gallery or the password page to which you are redirected after clicking on a gallery)
    const galleryAddress = 'http://www.fotoservice-tuwien.at/gallery2/main.php?g2_itemId=1466995';
    // name of the folder where the images should be saved
    const downloadFolder = 'Sponsion am 28. Juni 2022';

    // open browser
    const browser = await puppeteer.launch({ headless: true });
    // open new window
    const page = await browser.newPage();

    // open gallery address
    await page.goto(galleryAddress);
    // wait for the password form to load
    await page.waitForSelector('#Password1_tb');
    // type in the password
    await page.type('#Password1_tb', password);
    // submit the password
    await page.click('.inputTypeSubmit');
    // wait until the actual gallery shows some images
    await page.waitForSelector('#IFid1');
    // click on the first image
    await page.click('#IFid1');
    
    for (;;) {
        // wait until the image html-element has loaded
        await page.waitForSelector('#gsImageView img');
        // extract the preview url
        const textContent = await page.evaluate(() => {
            return document.querySelector("#gsImageView img").src;
        });
        // download the preview url
        await download(textContent, downloadFolder);
        
        console.log('Downloaded: ' + textContent);
        
        // wait to not strain the database (instant clicking may lead to errors)
        await sleep(100);
        
        // check if the next button is available (if its missing we are on the last page)
        const isNextButtonAvailable = (await page.$('.next'))
        if (!isNextButtonAvailable) {
            console.log('last page reached, ending...')
            break;
        }

        // click next
        await page.click('.next');
    }

    // close browser if we are finished
    await browser.close();
})();