const axios = require("axios");

async function fetchImageAsBase64(url, mimeType = "image/png") {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" }); // Descargar la imagen como buffer
        const base64 = Buffer.from(response.data).toString("base64");
        return `data:${mimeType};base64,${base64}`; // Retorna en formato correcto
    } catch (error) {
        console.error("Error al obtener la imagen:", error);
        return null;
    }
}

const createCaptchaTask = async (base64Image) => {
    try {
        const response = await axios.post('https://api.2captcha.com/createTask', {
            "clientKey": "6b9156a73100e1289f7fb99dbf529342",
            "task": {
                "type": "ImageToTextTask",
                "body": base64Image,
                "phrase": false,
                "case": true,
                "numeric": 0,
                "math": false,
                "minLength": 1,
                "maxLength": 0,
                "comment": "enter the text you see on the image"
            },
            "languagePool": "en"
        });

        return response.data.taskId;
    } catch (error) {
        console.error("Error al crear la tarea:", error);
        return null;
    }
}

const getTaskResult = async (taskId) => {
    try {
        const response = await axios.post('https://api.2captcha.com/getTaskResult', {
            "clientKey": "6b9156a73100e1289f7fb99dbf529342",
            "taskId": taskId
        })

        if (response.data.status !== 'ready') {
            return null
        }

        return response.data.solution.text
    } catch (error) {
        console.error("Error al obtener el resultado de la tarea:", error);
        return null

    }
}

const processCustomerPhone = async (records, csvWriter) => {
    try {
        const { cliente, producto, numero, cuenta } = records[0]

        await axios.post('http://localhost:3000/send-message', {
            "phone_number": `${cuenta}`,
            "message": `Hola soy PattyBot, tienes un cliente de nombre ${cliente} interesado en el producto ${producto} con el número ${numero}. ¿Podrías contactarlo?`
        })
    } catch (error) {
        console.log("Error al enviar el mensaje, pero se guardara como registro:", error)

        csvWriter
            .writeRecords(records)
            .then(() => console.log('Archivo CSV creado o actualizado correctamente.'));
    }

}

module.exports = {
    fetchImageAsBase64,
    createCaptchaTask,
    getTaskResult,
    processCustomerPhone
}