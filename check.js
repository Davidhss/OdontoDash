import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating to http://localhost:3002...');
  
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
  
  // Wait to see if error occurs during render
  await new Promise(r => setTimeout(r, 3000));

  await browser.close();
})();
