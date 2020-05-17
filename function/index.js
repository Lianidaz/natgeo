const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const s3 = new AWS.S3();

const dstBucket = "natgeo-pod";

const handler = async (event, context, cb) => {
  const gallery = await fetch(
    "https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.json"
  ).then((res) => res.json());
  const today = new Date();
  const dateArr = today.toDateString().split(" ");
  const str = `${dateArr[1]} ${dateArr[2]}, ${dateArr[3]}`;
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
  const mac = await sharp(img)
    .metadata()
    .then((meta) =>
      sharp(img)
        .resize(meta.width, Math.round((meta.width * 10) / 16))
        .toBuffer()
    );
  const mobile = await sharp(img)
    .metadata()
    .then((meta) =>
      sharp(img)
        .resize(Math.round(meta.height * 0.7), meta.height)
        .toBuffer()
    );

  try {
    const deskparams = {
      Bucket: dstBucket,
      Key: "desktop",
      Body: desktop,
      ContentType: "image",
    };
    const mobiparams = {
      Bucket: dstBucket,
      Key: "mobile",
      Body: mobile,
      ContentType: "image",
    };
    const macparams = {
      Bucket: dstBucket,
      Key: "mac",
      Body: mac,
      ContentType: "image",
    };

    let put = [];
    put[0] = s3.putObject(deskparams).promise();
    put[1] = s3.putObject(mobiparams).promise();
    put[2] = s3.putObject(macparams).promise();
    await Promise.all(put);
  } catch (error) {
    console.log(error);
    return;
  }
};

exports.handler = handler;
