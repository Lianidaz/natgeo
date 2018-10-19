const natgeo = require("national-geographic-api").NationalGeographicAPI;
const http = require("https");
const fs = require("fs");
const sharp = require("sharp");
const app = require("express")();
//app.use(require("morgan")("dev"));
const path = require('path')

let url = "";

let natG = function() {
  natgeo.getPhotoOfDay().then(result => {
    //   console.log(result.data[0].attributes.image.renditions);
    if (fs.existsSync('./podsq.jpg')) fs.unlinkSync('./podsq.jpg')
    if (fs.existsSync('./pod.jpg')) fs.unlinkSync('./pod.jpg')
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
                .resize(Math.round(meta.height * 0.7), meta.height)
                .toFile("./podsq.jpg")
            });
        });
      });
    });
  });
};

natG();
app.enable('trust proxy')
setInterval(natG, 3600000);
app.use("/", (req, res, next) => {
  console.log(
    req.ip,
    req.path,
    req.method,
    res.statusCode
  );
  next();
});

app.get("/desktop", (req, res) => {
  res.sendFile(path.resolve('./pod.jpg'));
});

app.get("/mobi", (req, res) => {
  res.sendFile(path.resolve('./podsq.jpg'));
});

app.listen(3383);
