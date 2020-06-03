const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

const dstBucket = "natgeo-pod";

exports.handler = async () => {
  try {
    const gallery = await fetch(
      "https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.json"
    ).then((res) => res.json());
    const today = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const str = `${
      monthNames[today.getMonth()]
    } ${today.getDate()}, ${today.getFullYear()}`;
    const jsonOD = gallery.items.find((i) => i.publishDate == str);
    const largest = jsonOD.image.renditions.reduce(
      (big, r) => {
        big = parseInt(big.width) < parseInt(r.width) ? r : big;
        return big;
      },
      { width: 0 }
    );
    const img = await fetch(largest.uri).then((res) => res.buffer());

    const desktop = await sharp(img)
      .metadata()
      .then((meta) =>
        sharp(img)
          .resize(meta.width, Math.round((meta.width * 9) / 16))
          .toBuffer()
      );
    const mobile = await sharp(img)
      .metadata()
      .then((meta) =>
        sharp(img)
          .resize(Math.round(meta.height * 0.7), meta.height)
          .toBuffer()
      );

    const deskparams = {
      Bucket: dstBucket,
      Key: "desktop",
      Body: desktop,
      ContentType: "image",
    };
    const mobiparams = {
      Bucket: dstBucket,
      Key: "mobile.jpg",
      Body: mobile,
      ContentType: "image",
    };

    let put = [];
    put[0] = s3.putObject(deskparams).promise();
    put[1] = s3.putObject(mobiparams).promise();
    await Promise.all(put);
  } catch (error) {
    console.error(error);
    return;
  }
};
