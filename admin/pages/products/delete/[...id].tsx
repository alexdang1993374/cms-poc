import Layout from "@/components/Layout";
import { productBaseState } from "@/pages/products";
import { IProduct } from "@/types";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const DeleteProductPage = () => {
  const router = useRouter();
  const [productInfo, setProductInfo] = useState<IProduct>(productBaseState);
  const { id } = router.query;

  useEffect(() => {
    if (!id) {
      return;
    }

    axios.get("/api/products?id=" + id).then((res) => {
      setProductInfo(res.data);
    });
  }, [id]);

  const goBack = () => {
    router.push("/products");
  };

  const deleteProduct = async () => {
    await axios.delete("/api/products?id=" + id);
    goBack();
  };

  return (
    <Layout>
      <h1 className="text-center">
        Do you really want to delete "{productInfo?.title}"?
      </h1>

      <div className="flex gap-2 justify-center">
        <button className="btn-red" onClick={deleteProduct}>
          YES
        </button>

        <button className="btn-default" onClick={goBack}>
          NO
        </button>
      </div>
    </Layout>
  );
};

export default DeleteProductPage;
