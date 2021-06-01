import puppeteer from 'puppeteer';

export default async function() {
    const browser = await puppeteer.launch({
        headless: false,
        args: [ '--use-fake-ui-for-media-stream' ]
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/webrtc-client/webrtc.html');

    page
    .on('console', message =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', response =>
      console.log(`${response.status()} ${response.url()}`))
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`))

    // await browser.close();
}
