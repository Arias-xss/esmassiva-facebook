const puppeteer = require('puppeteer'); // v22.0.0 or later

(async () => {
  const browser = await puppeteer.launch();

  const context = browser.defaultBrowserContext()
  await context.overridePermissions('https://www.facebook.com/', ['notifications'])

  const page = await browser.newPage();
  const timeout = 60000;
  page.setDefaultTimeout(timeout);

  {
    const targetPage = page;
    await targetPage.setViewport({
      width: 1903,
      height: 590
    })
  }
  {
    const targetPage = page;
    const promises = [];
    const startWaitingForEvents = () => {
      promises.push(targetPage.waitForNavigation());
    }
    startWaitingForEvents();
    await targetPage.goto('https://www.facebook.com/');
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(Correo electrónico o número de teléfono)'),
      targetPage.locator("[data-testid='royal_email']"),
      targetPage.locator('::-p-xpath(//*[@data-testid=\\"royal_email\\"])'),
      targetPage.locator(":scope >>> [data-testid='royal_email']")
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 70.5,
          y: 24,
        },
      });
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(Correo electrónico o número de teléfono)'),
      targetPage.locator("[data-testid='royal_email']"),
      targetPage.locator('::-p-xpath(//*[@data-testid=\\"royal_email\\"])'),
      targetPage.locator(":scope >>> [data-testid='royal_email']")
    ])
      .setTimeout(timeout)
      .fill('juanperez12tty@gmail.com');
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(Contraseña)'),
      targetPage.locator("[data-testid='royal_pass']"),
      targetPage.locator('::-p-xpath(//*[@data-testid=\\"royal_pass\\"])'),
      targetPage.locator(":scope >>> [data-testid='royal_pass']")
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 28.5,
          y: 18,
        },
      });
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(Contraseña)'),
      targetPage.locator("[data-testid='royal_pass']"),
      targetPage.locator('::-p-xpath(//*[@data-testid=\\"royal_pass\\"])'),
      targetPage.locator(":scope >>> [data-testid='royal_pass']")
    ])
      .setTimeout(timeout)
      .fill('Sange07.Teamo.069');
  }
  {
    const targetPage = page;
    const promises = [];
    const startWaitingForEvents = () => {
      promises.push(targetPage.waitForNavigation());
    }
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(Iniciar sesión[role=\\"button\\"])'),
      targetPage.locator("[data-testid='royal_login_button']"),
      targetPage.locator('::-p-xpath(//*[@data-testid=\\"royal_login_button\\"])'),
      targetPage.locator(":scope >>> [data-testid='royal_login_button']")
    ])
      .setTimeout(timeout)
      .on('action', () => startWaitingForEvents())
      .click({
        offset: {
          x: 48.5,
          y: 16.921875,
        },
      });
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('[aria-label="Messenger"]')
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 33,
          y: 21,
        },
      });
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('div.x13vifvy > div > div > div > div:nth-of-type(2) a'),
      targetPage.locator('::-p-xpath(//*[@id=\\"mount_0_0_lA\\"]/div/div[1]/div/div[2]/div[5]/div[2]/div/div[2]/div[1]/div[1]/div/div/div/div/div/div/div[1]/div/div/div/div[2]/div/span/a)'),
      targetPage.locator(':scope >>> div.x13vifvy > div > div > div > div:nth-of-type(2) a'),
      targetPage.locator('::-p-text(Ver todo en Messenger)')
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 106.8125,
          y: 11.984375,
        },
      });
  }

  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('div.x9f619 > div.x2lah0s div:nth-of-type(2) > div > div:nth-of-type(1) > div > div > div > div > div > div > div > div > div > div > div.x1iyjqo2 > div > div > div > div > div:nth-of-type(2) div'),
      targetPage.locator('::-p-xpath(//*[@id=\\":r23:\\"]/div/div/div/div/div/div[2]/div/div[1]/div/div/div/div/div/div/div/div/div/div/div[2]/div/div/div/div/div[2]/span/span/div)'),
      targetPage.locator(':scope >>> div.x9f619 > div.x2lah0s div:nth-of-type(2) > div > div:nth-of-type(1) > div > div > div > div > div > div > div > div > div > div > div.x1iyjqo2 > div > div > div > div > div:nth-of-type(2) div')
    ])
      .setTimeout(timeout)
      .click({
        offset: {
          x: 47,
          y: 1.515625,
        },
      });
  }

  {
    const targetPage = page;

    setInterval(async () => {
      for (const index of [1, 2, 3, 4, 5, 6]) {
        await targetPage.waitForSelector(`[aria-label="Lista de conversaciones"] > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(${index}) > div > div > div > div > div > div > div > a > div > div> div:nth-of-type(2) > div > div > div > span`)

        const selectorMessage = await targetPage.$eval(
          `[aria-label="Lista de conversaciones"] > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(${index}) > div > div > div > div > div > div > div > a > div > div> div:nth-of-type(2) > div > div > div > span`,
          (element) => {
            const computedStyle = window.getComputedStyle(element);
            return computedStyle.fontWeight;
          })

        console.log(`Mensaje leido? ${selectorMessage != '600' ? 'Si' : 'No'}`)

        if (selectorMessage == '600') {
          await puppeteer.Locator.race([
            targetPage.locator(`[aria-label="Lista de conversaciones"] > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(${index})`),
          ])
            .setTimeout(timeout)
            .click();

          await puppeteer.Locator.race([
            targetPage.locator('[aria-label="Mensaje"]'),
            targetPage.locator('p-aria(Mensaje)'),
          ])
            .setTimeout(timeout)
            .click();

          const selectorText = await targetPage.$eval('[aria-label^="Conversación titulada"]', (element) => {
            return element.innerText
          })
          const cleanText = selectorText.split('·')[1].split('.')[0].trim()

          await puppeteer.Locator.race([
            targetPage.locator('[aria-label="Mensaje"]'),
            targetPage.locator('p-aria(Mensaje)'),
          ]).fill(`Buenas. Si. 😄 Cada pedido es procesado  por Whatsapp ✅ Podes escribirme al Whatsapp 0984 197 921 O directo en el link https://wa.me/595984197921?text=${encodeURIComponent('Buenas, quisiera mas informacion sobre este producto ' + cleanText)} 😊 \n`)

          console.log(`Mensaje respondido a este producto: ${cleanText}`)
        }
      }
    }, 15000);
  }

})().catch(err => {
  console.error(err);
  process.exit(1);
});
