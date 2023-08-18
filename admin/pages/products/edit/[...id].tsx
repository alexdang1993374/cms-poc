import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import Spinner from "@/components/Spinner";
import { productBaseState } from "@/pages/products";
import { IProduct } from "@/types";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const EditProductPage = () => {
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<IProduct>(productBaseState);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    const fetchProduct = async () => {
      if (isMounted) {
        setLoading(true);
      }

      const res = await axios.get("/api/products?id=" + id);

      if (isMounted) {
        setProductInfo(res.data);
        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <Layout>
      <h1>Edit Product: {productInfo.title}</h1>
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        productInfo && (
          <ProductForm
            _id={productInfo._id}
            title={productInfo.title}
            description={productInfo.description}
            images={productInfo.images}
            category={productInfo.category}
            properties={productInfo.properties}
          />
        )
      )}
    </Layout>
  );
};

export default EditProductPage;
