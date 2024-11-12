const puppeteer = require('puppeteer'); // v22.0.0 or later
require('dotenv').config()
const path = require('path');
const os = require('os');
const fs = require('fs');

const phoneNumber = process.env.PHONE_NUMBER.split('').splice(1).join('');
const emailAddress = process.env.EMAIL;
const password = process.env.PASSWORD;
const showBrowser = !(process.env.SHOW_BROWSER === 'S')

const timeout = 300000;

async function checkMessages(targetPage, controlandoTimes) {
  console.log("Controlando...")
  controlandoTimes++
  if (await targetPage.evaluate(() => document.querySelector('[aria-label="Cerrar"]') !== null)) {
    if (await targetPage.evaluate(() => document.querySelector('[aria-label="¿Continuar sin sincronizar?"] > div:nth-of-type(3) > div > div > div:nth-of-type(2)') !== null)) {
      console.log('Pide PIN para continuar')

      await puppeteer.Locator.race([
        targetPage.locator('[aria-label="¿Continuar sin sincronizar?"] > div:nth-of-type(3) > div > div > div:nth-of-type(2)'),
      ])
        .setTimeout(timeout)
        .click();

      console.log('Pin cerrado con exito!')
    }
  }

  for (const index of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]) {
    const listMessages = `[aria-label="Lista de conversaciones"] > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(${index}) > div > div > div > div > div > div > div > a > div > div> div:nth-of-type(2) > div > div > div > span`

    if (await targetPage.evaluate((selector) => document.querySelector(selector) !== null, listMessages)) {
      await targetPage.waitForSelector(`[aria-label="Lista de conversaciones"] > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(${index}) > div > div > div > div > div > div > div > a > div > div> div:nth-of-type(2) > div > div > div > span`)

      const selectorMessage = await targetPage.$eval(
        `[aria-label="Lista de conversaciones"] > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(${index}) > div > div > div > div > div > div > div > a > div > div> div:nth-of-type(2) > div > div > div > span`,
        (element) => {
          const computedStyle = window.getComputedStyle(element);
          return computedStyle.fontWeight;
        })

      controlandoTimes = 0
      console.log(`Mensaje leido? ${selectorMessage != '600' ? 'Si' : 'No'} - POS ${index}`)

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

        const selectorText = await targetPage.$eval('[aria-label^="Conversación"]', (element) => {
          return element.innerText
        })
        const cleanText = selectorText.split('·')[1].split('.')[0].trim()

        await puppeteer.Locator.race([
          targetPage.locator('[aria-label="Mensaje"]'),
          targetPage.locator('p-aria(Mensaje)'),
        ]).fill(`Buenas. Si. 😄 Cada pedido es procesado  por Whatsapp ✅ Podes escribirme al Whatsapp 0${phoneNumber} O directo en el link https://wa.me/595${phoneNumber}?text=${encodeURIComponent('Buenas!')} 😊 \n`)

        console.log(`Mensaje respondido a este producto: ${cleanText}`)

        await new Promise((resolve, _) => {
          setTimeout(() => {
            resolve(null)
          }, 5000);
        })
      }
    }
  }

  await new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Controlando veces sin responder ", controlandoTimes)

      if(controlandoTimes >= 5){
        reject(new Error("La cuenta no esta respondiendo correctamente"))
      }
      
      await checkMessages(targetPage, controlandoTimes)
      resolve(null)
    }, 15000);
  })
}

let browser = null;
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer_profile_'));

(async () => {
  try {
    browser = await puppeteer.launch({
      userDataDir: userDataDir,
      headless: showBrowser
    });

    const context = browser.defaultBrowserContext()
    await context.overridePermissions('https://www.facebook.com/', ['notifications'])

    const page = await browser.newPage();
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
        .fill(emailAddress);
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
        .fill(password);

      console.log('Inicio sesion correctamente')
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

      console.log('Ingreso al messenger')
    }
    {
      const targetPage = page;
      const promises = [];
      const startWaitingForEvents = () => {
        promises.push(targetPage.waitForNavigation());
      }
      startWaitingForEvents();
      await targetPage.goto('https://www.facebook.com/messages/t');
      await Promise.all(promises);
    }

    {
      const targetPage = page;

      await page.waitForSelector('body', { timeout });

      console.log('Ingreso al marketplace')

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Eseprandoooo")
        }, 10000);
      })

      if (await targetPage.evaluate(() => document.querySelector('[aria-label="Cerrar"]') !== null)) {
        await puppeteer.Locator.race([
          targetPage.locator('[aria-label="Cerrar"]'),
        ])
          .setTimeout(timeout)
          .click();

        if (await targetPage.evaluate(() => document.querySelector('[aria-label="¿Continuar sin sincronizar?"] > div:nth-of-type(3) > div > div > div:nth-of-type(2)') !== null)) {
          console.log('Pide PIN para continuar')

          await puppeteer.Locator.race([
            targetPage.locator('[aria-label="¿Continuar sin sincronizar?"] > div:nth-of-type(3) > div > div > div:nth-of-type(2)'),
          ])
            .setTimeout(timeout)
            .click();

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

          console.log('Pin cerrado con exito!')
        }
      }

      const elementFound = await page.evaluate(() => {
        // Usa XPath para encontrar el elemento
        const xpath = "//span[text() = 'Marketplace']";
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const element = result.singleNodeValue;

        if (element) {
          // Simula un clic en el elemento
          element.click();
          return true;
        } else {
          return false;
        }
      });

      if (elementFound) {
        console.log('Elemento encontrado y clicado');
      } else {
        console.log('Elemento no encontrado');
      }
    }

    {
      const targetPage = page;

      console.log("Empieza a responder los mensajes")

      await page.evaluate(() => {
        // Usa XPath para encontrar el elemento
        const xpath = "//span[text() = 'Marketplace']";
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const element = result.singleNodeValue;

        if (element) {
          // Simula un clic en el elemento
          element.click();
          return true;
        } else {
          return false;
        }
      });

      var controlandoTimes = 0
      await checkMessages(targetPage, controlandoTimes)
    }
  } catch (error) {
    console.log(error)

    await browser.close();
    // Eliminar el directorio temporal si ya no se necesita
    fs.rmdirSync(userDataDir, { recursive: true });

    process.exit(1)
  }
})()
