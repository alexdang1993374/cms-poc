import { mongooseConnect } from "@/lib/mongoose";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import multiparty from "multiparty";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "./auth/[...nextauth]";

const bucketName = "wiiizy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  const form = new multiparty.Form();

  // @ts-ignore
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const client = new S3Client({
    region: "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });

  const links: string[] = [];

  for (const file of files.file) {
    const ext = file.originalFilename.split(".").pop();
    const newFilename = Date.now() + "." + ext;
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: newFilename,
        Body: fs.readFileSync(file.path),
        ACL: "public-read",
        ContentType: mime.lookup(file.path) as string,
      })
    );
    const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
    links.push(link);
  }

  return res.json({ links });
}

export const config = {
  api: { bodyParser: false },
};
