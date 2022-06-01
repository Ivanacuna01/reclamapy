/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = 'EAAXoZCCZBMOEoBAEF2ZCKmPtnS9PmJJ8dBE23ZCq38lhLNI4xNu5ayZCOmuuc5uTdYXRrFZCbGnP9I5uyKZAaY5ttJQdZBVMYqjCinNX1akb0JphNHYLIyWkIf6BKHTZBvGWWw1KZAPallbStWXsf1tmfBziloPtkEDENl0qmlsQCZAZCAhG6V64xkBSXhU1E0t8DY53LahNkWwt18QCeVr9ftnQTVwFhnbWvhcZD';
let flag = 0;
let nombre
let reclamo 
let ubicacion
let payload
let iden
let identificador


// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  let data = null;

  try {
    // Check the Incoming webhook message
    //console.log(JSON.stringify(req.body, null, 2));

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id =
          req.body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        let type = req.body.entry[0].changes[0].value.messages[0].type;
        
        let msg_body;

        switch (flag) {
          case 0:
            data = {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: from,
              type: "template",
              template: {
                name: "step_1",
                language: {
                  code: "es_MX",
                },
              },
            };
            flag += 1;
            break;
          case 1:
            if (req.body.entry[0].changes[0].value.messages[0].button.payload) {
              payload = req.body.entry[0].changes[0].value.messages[0].button.payload;
              if (payload == 'ANDE') {
              msg_body = 'Ingrese su NIS:'
                iden = "NIS"
                flag += 1;
            } else if (payload == 'ESSAP') {
              msg_body = 'Ingrese su ISSAN:'
              iden = "ISSAN"
              flag += 1;
            }
            }
            break;
          case 2:
            if (req.body.entry[0].changes[0].value.messages[0].text.body) {
               identificador = req.body.entry[0].changes[0].value.messages[0].text.body;
               msg_body = "Ingrese su nombre y apellido:";
               flag += 1;
            }
            break;
          case 3:
            nombre = req.body.entry[0].changes[0].value.messages[0].text.body;
            console.log(nombre)
            msg_body = "Ingrese su reclamo:";
            flag += 1;
            break;
          case 4:
            reclamo = req.body.entry[0].changes[0].value.messages[0].text.body;
            console.log(reclamo)
            msg_body = "Envie su ubicacion:";
            flag += 1;
            break;
          case 5:
            ubicacion = req.body.entry[0].changes[0].value.messages[0].location;
            console.log(typeof ubicacion);
            msg_body = "Su reclamo ha sido procesado.";
            axios({
              method: "POST", // Required, HTTP method, a string, e.g. POST, GET
              url:
                "https://graph.facebook.com/v13.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token,
              data: data || {
              messaging_product: "whatsapp",
              to: 595985830794,
              text: { body: `Se ha realizado un reclamo de ${payload} a nombre de ` + nombre + " con " + iden + " " + identificador + " con el asunto: " + reclamo + ". Siendo su ubicacion: " + ubicacion},
          },
          headers: { "Content-Type": "application/json" },
        });
            axios({
              method: "POST",
              url:
                "https://graph.facebook.com/v13.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token,
              data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: 595985830794,
                type: "location",
                location: ubicacion,
              } 
        });
            flag = 0;
            break;
          default:
            msg_body = "Desea realizar un reclamo?";
            break;
        }

        await axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
            "https://graph.facebook.com/v13.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: data || {
            messaging_product: "whatsapp",
            to: from,
            text: { body: msg_body },
          },
          headers: { "Content-Type": "application/json" },
        });
      }
      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
  }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = "holis";

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

