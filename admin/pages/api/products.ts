import type { NextApiRequest, NextApiResponse } from "next";
import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { method } = req;

  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      res.json(await Product.find());
    }
  }

  if (method === "POST") {
    const { title, description, header, images, category, properties } =
      req.body;

    const productDoc = await Product.create({
      title,
      description,
      header,
      bullets: [],
      images,
      category,
      properties,
    });

    res.json(productDoc);
  }

  if (method === "PUT") {
    const { title, description, header, _id, images, category, properties } =
      req.body;
    await Product.updateOne(
      { _id },
      { title, description, header, images, bullets: [], category, properties }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query.id });
      res.json(true);
    }
  }
}
