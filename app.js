import express from "express";
import { engine } from "express-handlebars";
import handlebars from "handlebars";
import _ from "lodash";
import moment from "moment";

const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  const data = {
    generated: {},
  };

  res.render("home", data);
});

app.get("/:layout", (req, res) => {
  const { layout } = req.params;

  const data = {
    generated: {},
    layout,
  };

  res.render("home", data);
});

app.listen(3000);

handlebars.registerHelper("isEqual", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

handlebars.registerHelper("isNotEqual", function (v1, v2, options) {
  if (v1 !== v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

handlebars.registerHelper("startCase", (val) => _.startCase(val));

handlebars.registerHelper("toUpper", (text = "") => _.toUpper(text));

handlebars.registerHelper("toLower", (text = "") => _.toLower(text));

handlebars.registerHelper("timestampStringToDate", (date) =>
  moment(_.toNumber(date)).format("YYYY-MM-DD")
);

handlebars.registerHelper("ifAnyTwoExists", (data1, data2, options) => {
  if (data1 || data2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
