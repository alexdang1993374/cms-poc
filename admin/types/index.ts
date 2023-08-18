export interface IProduct {
  _id: string;
  title: string;
  header: string;
  description: string;
  bullets: any;
  images: any;
  category: any;
  properties: Record<string, string>;
}

export interface IProductForm extends Partial<IProduct> {}
