interface ITranslation {
  en: string;
  th: string;
}

export interface IPrice {
  tier1Price: number;
  tier2Price: number;
  tier3Price: number;
}

export interface IProduct {
  _id: string;
  title: string;
  description: ITranslation;
  bullets: any;
  images: any;
  category: any;
  properties: Record<string, string>;
}

export interface IProductForm extends Partial<IProduct> {}
