import { ICategory } from "@/pages/categories";
import { IProductForm } from "@/types";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import Spinner from "./Spinner";

const ProductForm = ({
  _id,
  title: existingTitle,
  description: existingDescription,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}: IProductForm) => {
  const [title, setTitle] = useState(existingTitle || "");
  const [englishDescription, setEnglishDescription] = useState(
    existingDescription?.en || ""
  );
  const [thaiDescription, setThaiDescription] = useState(
    existingDescription?.th || ""
  );
  const [images, setImages] = useState(existingImages || []);
  const [category, setCategory] = useState(assignedCategory || "");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [productProperties, setProductProperties] = useState<
    Record<string, string>
  >(assignedProperties || { Grade: "AA", Type: "Sativa" });
  console.log(
    "🚀 ~ file: ProductForm.tsx:40 ~ productProperties:",
    productProperties
  );
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (_id) {
      setTitle(existingTitle as string);
      setEnglishDescription(existingDescription?.en as string);
      setThaiDescription(existingDescription?.th as string);
      setImages(existingImages);
      setCategory(assignedCategory);
      setProductProperties(assignedProperties || {});
    }
  }, [
    existingTitle,
    existingDescription,
    existingImages,
    assignedCategory,
    assignedProperties,
  ]);

  useEffect(() => {
    axios.get("/api/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

  const saveProduct = async (e: any) => {
    e.preventDefault();
    const data = {
      title,
      description: { en: englishDescription, th: thaiDescription },

      images,
      category,
      properties: productProperties,
    };
    if (_id) {
      //update
      await axios.put("/api/products", { ...data, _id });
    } else {
      //create
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  };

  const uploadImages = async (e: any) => {
    const files = e.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }

      const res = await axios.post("/api/upload", data);

      setImages((oldImages: any) => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  };

  const updateImagesOrder = (images: any) => {
    setImages(images);
  };

  const handleChangeProductProperty = (propertyName: string, value: string) => {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propertyName] = value;
      return newProductProps;
    });
  };

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let categoryInfo = categories.find(({ _id }) => _id === category);
    // @ts-ignore
    propertiesToFill.push(...categoryInfo?.properties);
    while (categoryInfo?.parent?._id) {
      const parentCategory = categories.find(
        ({ _id }) => _id === categoryInfo?.parent?._id
      );
      // @ts-ignore
      propertiesToFill.push(...parentCategory?.properties);
      categoryInfo = parentCategory;
    }
  }

  if (goToProducts) {
    router.push("/products");
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
      </select>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map((property) => (
          <div key={property._id}>
            <label>
              {property.name[0].toUpperCase() + property.name.substring(1)}
            </label>

            <div>
              <select
                value={productProperties[property?.name]}
                onChange={(e) =>
                  handleChangeProductProperty(property.name, e.target.value)
                }
              >
                {property.values.map((value: string, index: number) => (
                  <option key={value + index} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          setList={updateImagesOrder}
          className="flex flex-wrap gap-1"
        >
          {!!images?.length &&
            images.map((link: any) => (
              <div key={link} className="h-24 cursor-pointer rounded-sm">
                <img src={link} alt="uploaded-photo" className="rounded-sm" />
              </div>
            ))}
        </ReactSortable>

        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}

        <label className="w-24 h-24 text-center flex flex-col items-center justify-center text-sm gap-1 rounded-sm text-primary bg-white shadow-sm cursor-pointer border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>

          <div>Add image</div>

          <input type="file" className="hidden" onChange={uploadImages} />
        </label>

        {!images?.length && <div>No photos for this product</div>}
      </div>

      <label>Description</label>

      <p>en</p>
      <textarea
        placeholder="en description"
        value={englishDescription}
        onChange={(e) => setEnglishDescription(e.target.value)}
      />

      <p>th</p>
      <textarea
        placeholder="th description"
        value={thaiDescription}
        onChange={(e) => setThaiDescription(e.target.value)}
      />

      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
};

export default ProductForm;
