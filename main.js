const puppeteer = require('puppeteer'); // v22.0.0 or later
require('dotenv').config()
const path = require('path');
const os = require('os');
const fs = require('fs');
const { fetchImageAsBase64, createCaptchaTask, getTaskResult, processCustomerPhone } = require('./utils');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const phoneNumber = process.env.PHONE_NUMBER.split('').splice(1).join('');
const emailAddress = process.env.EMAIL;
const password = process.env.PASSWORD;
const showBrowser = !(process.env.SHOW_BROWSER === 'S')

const timeout = 300000000;

let browser = null;
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer_profile_'));
const cookiesFilePath = 'cookies.json';

const csvWriter = createCsvWriter({
  path: 'contacto.csv', // Nombre del archivo
  header: [
    { id: 'cliente', title: 'Cliente' },
    { id: 'producto', title: 'Producto' },
    { id: 'numero', title: 'Numero' },
    { id: 'cuenta', title: 'Cuenta' },
  ],
  append: fs.existsSync('contacto.csv'), // Si el archivo existe, agrega los datos
});

async function loginUser(targetPage) {
  const promises = [];

  await puppeteer.Locator.race([
    targetPage.locator('::-p-aria(Correo electrónico o número de teléfono)'),
    targetPage.locator('::-p-aria(Email or phone number)'),
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

  await puppeteer.Locator.race([
    targetPage.locator('::-p-aria(Correo electrónico o número de teléfono)'),
    targetPage.locator('::-p-aria(Email or phone number)'),
    targetPage.locator("[data-testid='royal_email']"),
    targetPage.locator('::-p-xpath(//*[@data-testid=\\"royal_email\\"])'),
    targetPage.locator(":scope >>> [data-testid='royal_email']")
  ])
    .setTimeout(timeout)
    .fill(emailAddress);

  await puppeteer.Locator.race([
    targetPage.locator('::-p-aria(Contraseña)'),
    targetPage.locator('::-p-aria(Password)'),
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

  await puppeteer.Locator.race([
    targetPage.locator('::-p-aria(Contraseña)'),
    targetPage.locator('::-p-aria(Password)'),
    targetPage.locator("[data-testid='royal_pass']"),
    targetPage.locator('::-p-xpath(//*[@data-testid=\\"royal_pass\\"])'),
    targetPage.locator(":scope >>> [data-testid='royal_pass']")
  ])
    .setTimeout(timeout)
    .fill(password);

  const startWaitingForEvents = () => {
    promises.push(targetPage.waitForNavigation());
  }
  await puppeteer.Locator.race([
    targetPage.locator('::-p-aria(Iniciar sesión[role=\\"button\\"])'),
    targetPage.locator('::-p-aria(Log In[role=\\"button\\"])'),
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

        await new Promise((resolve, _) => {
          setTimeout(() => {
            resolve(null)
          }, 5000);
        })

        const [customerPhoneNumberValue, customerDataValue, chatOpennedValue, secondResponseValue] = await targetPage.evaluate((phoneNumber) => {
          // Usa XPath para encontrar el elemento
          const xpath = '//div[contains(@aria-label, "Mensajes de la conversación")]'
          const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

          if (
            result.singleNodeValue.childNodes.length > 0 &&
            result.singleNodeValue.childNodes[0].childNodes.length > 0 &&
            result.singleNodeValue.childNodes[0].childNodes[0].childNodes.length > 0 &&
            result.singleNodeValue.childNodes[0].childNodes[0].childNodes[0].childNodes.length > 0
          ) {
            const extractAndNormalizePhoneNumber = (message, phone = phoneNumber) => {
              const phoneRegex = /(?:\+?595|0|9)?\d{7,10}/;

              const match = message.match(phoneRegex);

              if (!match) {
                return false;
              }

              // Normalize the captured number
              let phoneNumberCustomer = match[0];

              // Remove all non-numeric characters
              phoneNumberCustomer = phoneNumberCustomer.replace(/\D/g, '');

              // If the number starts with '0', remove it
              if (phoneNumberCustomer.startsWith('0')) {
                phoneNumberCustomer = phoneNumberCustomer.slice(1);
              }

              // Add the +595 prefix
              const normalizedNumber = '+595' + phoneNumberCustomer;

              if (`+595${phone}` === normalizedNumber) {
                return false
              }

              return normalizedNumber;
            }

            var customerPhoneNumber = false
            var chatOpenned = false
            var secondResponse = false

            for (const chatItem of result.singleNodeValue.childNodes[0].childNodes[0].childNodes[0].childNodes) {
              customerPhoneNumber = extractAndNormalizePhoneNumber(chatItem.innerText) !== false ? extractAndNormalizePhoneNumber(chatItem.innerText) : customerPhoneNumber
              chatOpenned = chatOpenned === false ? chatItem.innerText.search('Cada pedido es procesado  por Whatsapp') > -1 : chatOpenned
              secondResponse = secondResponse === false ? chatItem.innerText.search('si podrias brindarme tu número de celular asi puedo escribirte') > -1 : secondResponse
            }

            const customerData = result.singleNodeValue.getAttribute('aria-label').split('·')
            customerData[0] = customerData[0].replace('Mensajes de la conversación con el título ', '').trim()

            return [customerPhoneNumber, customerData, chatOpenned, secondResponse]
          }
        }, phoneNumber);

        if (customerPhoneNumberValue) {
          const records = [
            { cliente: customerDataValue[0], producto: customerDataValue[1], numero: customerPhoneNumberValue, cuenta: `0${phoneNumber}` },
          ];

          await processCustomerPhone(records, csvWriter)
        }

        if (!chatOpennedValue && !secondResponseValue) {
          await puppeteer.Locator.race([
            targetPage.locator('[aria-label="Mensaje"]'),
            targetPage.locator('p-aria(Mensaje)'),
          ]).fill(`Buenas. Si. 😄 Cada pedido es procesado  por Whatsapp ✅ Podes escribirme al Whatsapp 0${phoneNumber} O directo en el link https://wa.me/595${phoneNumber}?text=${encodeURIComponent('Buenas!')} 😊 \n`)
        } else if (chatOpennedValue && !secondResponseValue) {
          await puppeteer.Locator.race([
            targetPage.locator('[aria-label="Mensaje"]'),
            targetPage.locator('p-aria(Mensaje)'),
          ]).fill(`Para una mejor atención, si podrias brindarme tu número de celular asi puedo escribirte, gracias 😊 \n`)
        }
        // console.log(`Mensaje respondido a este producto: ${cleanText}`)
        console.log(`Mensaje respondido!`)
      }
    }
  }

  await new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Controlando veces sin responder ", controlandoTimes)

      if (controlandoTimes >= 5) {
        await browser.close();
        fs.rmdirSync(userDataDir, { recursive: true });

        process.exit(1)
      }

      await checkMessages(targetPage, controlandoTimes)
      resolve(null)
    }, 15000);
  })
}

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

    if (fs.existsSync(cookiesFilePath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
      await page.setCookie(...cookies);
      console.log("Cookies cargadas.");
    }

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

      if (!fs.existsSync(cookiesFilePath)) {
        await loginUser(targetPage)
      }
    }
    {
      const targetPage = page;
      let promises = [];
      const startWaitingForEvents = () => {
        promises.push(targetPage.waitForNavigation());
      }

      startWaitingForEvents();

      if (!fs.existsSync(cookiesFilePath)) {
        await new Promise((resolve, _) => {
          setTimeout(() => {
            resolve(null)
          }, 15000);
        })

        // Check for captcha
        const currentPage = page.url();

        if (currentPage.search('/two_step_verification/authentication/') > -1) {
          console.log('Pide verificación de captcha')

          if (await targetPage.evaluate(() => document.querySelector('img') !== null && document.querySelector('img').getAttribute('src').search('captcha') > -1)) {
            const captchaUrl = await targetPage.evaluate(() => document.querySelector('img').getAttribute('src'));

            const base64Image = await fetchImageAsBase64(captchaUrl)

            const taskIdCaptcha = await createCaptchaTask(base64Image)

            await new Promise((resolve, _) => {
              setTimeout(() => {
                resolve(null)
              }, 10000);
            })

            const captchaText = await getTaskResult(taskIdCaptcha)

            await puppeteer.Locator.race([
              targetPage.locator('.x1i10hfl.xggy1nq.x1s07b3s.x1kdt53j.x1a2a7pz.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x9f619.xzsf02u.x1uxerd5.x1fcty0u.x132q4wb.x1a8lsjc.x1pi30zi.x1swvt13.x9desvi.xh8yej3'),
            ]).fill(captchaText)

            await puppeteer.Locator.race([
              targetPage.locator('.x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xtvsq51.xi112ho.x17zwfj4.x585lrc.x1403ito.x1fq8qgq.x1ghtduv.x1oktzhs'),
            ])
              .setTimeout(timeout)
              .click({
                offset: {
                  x: 48.5,
                  y: 16.921875,
                },
              });

            promises = [];
            const startWaitingForEvents = () => {
              promises.push(targetPage.waitForNavigation());
            }

            startWaitingForEvents();

            await new Promise((resolve, _) => {
              setTimeout(() => {
                resolve(null)
              }, 15000);
            })
          }
        }
      }

      await targetPage.goto('https://www.facebook.com/messages/t');
      await Promise.all(promises);

      await new Promise((resolve, _) => {
        setTimeout(() => {
          resolve(null)
        }, 15000);
      })

      console.log('Ingreso al messenger')
    }

    {
      const targetPage = page;

      await page.waitForSelector('body', { timeout });

      console.log('Ingreso al marketplace')

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Esperando...")
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

      if (!fs.existsSync(cookiesFilePath)) {
        // Guardar cookies después del inicio de sesión
        const cookies = await page.cookies();
        fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
        console.log("Cookies guardadas.");
      }


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
