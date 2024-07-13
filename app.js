import express from "express";
import nodemailer from "nodemailer";
import { engine } from "express-handlebars";
import handlebars from "handlebars";
import _ from "lodash";
import moment from "moment";
import fs from "fs";
import { config as configDotenv } from "dotenv";

configDotenv();

const app = express();

// Configure Handlebars engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

// Routes
app.get("/", (req, res) => {
  const data = {
    generated: {},
  };
  res.render("home", data);
});

app.get("/layout/:layout/:customer", (req, res) => {
  const { layout, customer } = req.params;
  const data = generateTestData(customer, layout);
  res.render("home", data);
});

app.get("/email/:customer", (req, res) => {
  const { customer } = req.params;
  const data = generateTestData(customer);

  const source = fs.readFileSync("views/layouts/mode_success_ftl_rate.handlebars", "utf8");
  const template = handlebars.compile(source);
  const html = template(data);

  const emailData = {
    to: ["sharma.pratap22@gmail.com"],
    subject: `Email Template Test using custom Vars - ${customer}`,
    html: html,
    context: data,
  };

  transporter.sendMail(emailData, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send({ error: true });
    } else {
      console.log("Message sent: %s", info.messageId);
      res.status(200).send({ error: false });
    }
  });
});

// Helper functions registration
registerHandlebarsHelpers();

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Helper functions
function generateTestData(customer, layout = "home") {
  return {
    generated: {
      response_reformat: {
        data: {
          result: {
            customer_type: customer,
            time_of_day: "morning",
          },
        },
      },
      model_extraction: {
        extracted_data: {
          shipment_details: {
            origin: [
              {
                city: "Los Angeles",
                state_code: "CA",
                zip_code: "90001",
                agent_iata_code: "LAX",
              },
            ],
            destination: [
              {
                city: "New York",
                state_code: "NY",
                zip_code: "10001",
                agent_iata_code: "JFK",
              },
            ],
          },
        },
      },
      extract_email: {
        sender_user_name: "John Doe",
        sender_email_address: "john.doe@example.com",
      },
      generate_quotes: {
        data: [
          {
            total: "1500",
            fsc: "200",
            total_rate: "1700",
            transaction_id: "Q123456789",
          },
        ],
      },
      mapping: {
        result: {
          extracted_data: [
            {
              trailer_details: [
                {
                  trailer_type: "Flatbed",
                },
              ],
            },
          ],
        },
      },
    },
    layout,
  };
}

function registerHandlebarsHelpers() {
  handlebars.registerHelper("isEqual", function (v1, v2, options) {
    return v1 === v2 ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper("isNotEqual", function (v1, v2, options) {
    return v1 !== v2 ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper("startCase", (val) => _.startCase(val));

  handlebars.registerHelper("toUpper", (text = "") => _.toUpper(text));

  handlebars.registerHelper("toLower", (text = "") => _.toLower(text));

  handlebars.registerHelper("timestampStringToDate", (date) =>
    moment(_.toNumber(date)).format("YYYY-MM-DD")
  );

  handlebars.registerHelper("ifAnyTwoExists", function (data1, data2, options) {
    return data1 || data2 ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper("setVars", function (vars, options) {
    Object.keys(vars).forEach((key) => {
      this[key] = vars[key];
    });
    return "";
  });

  handlebars.registerHelper("getVar", function (varName) {
    return this[varName];
  });

  handlebars.registerHelper("object", function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    const result = {};
    for (let i = 0; i < args.length; i += 2) {
      result[args[i]] = args[i + 1];
    }
    return result;
  });
}
