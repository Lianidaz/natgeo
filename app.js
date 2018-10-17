const natgeo = require("national-geographic-api").NationalGeographicAPI;
const http = require("https");
const fs = require("fs");
const sharp = require("sharp");
const app = require("express")();
//app.use(require("morgan")("dev"));
let url = "";

let natG = function() {
  natgeo.getPhotoOfDay().then(result => {
    //   console.log(result.data[0].attributes.image.renditions);

    let pod = fs.createWriteStream("pod.jpg");
    let rends = result.data[0].attributes.image.renditions;
    let width = 0;
    let height = 0;
    for (let u of rends) {
      if (parseInt(u.width, 10) > width) {
        url = u.uri;
        width = u.width;
        height = u.height;
      }
    }

    http.get(url, resp => {
      resp.pipe(pod);
      pod.on("finish", () => {
        pod.close(() => {
          sharp("./pod.jpg")
            .metadata()
            .then(meta => {
              return sharp("./pod.jpg")
                .resize(meta.height, meta.height)
                .toFile("./podsq.jpg")
                .then(() => {
                  fs.unlinkSync("./pod.jpg");
                });
            });
        });
      });
    });
  });
};

natG();

setInterval(natG, 3600000);
app.use("/", (req, res, next) => {
  console.log(
    req.connection.remoteAddress,
    req.path,
    req.method,
    res.statusCode
  );
  next();
});

app.get("/desktop", (req, res) => {
  res.redirect(url);
});

app.get("/mobi", (req, res) => {
  res.sendFile("./podsq.jpg");
});

app.listen(3383);
