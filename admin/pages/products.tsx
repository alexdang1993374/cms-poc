import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";
import { IProduct } from "@/types";
import axios from "axios";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react";

export const productBaseState = {
  title: "",
  description: {
    en: "",
    th: "",
  },
  price: {
    tier1Price: 0,
    tier2Price: 0,
    tier3Price: 0,
  },
  _id: "",
  images: [],
  category: "",
  properties: {},
};

type TFilter = "price" | "title";

const Products = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [activeFilter, setActiveFilter] = useState<TFilter>("price");

  const sortProducts = () => {
    if (activeFilter === "price") {
      return products.sort((a, b) => a.price.tier1Price - b.price.tier1Price);
    } else {
      return products.sort((a, b) => a.title.localeCompare(b.title));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      if (isMounted) {
        setLoading(true);
      }

      const res = await axios.get("/api/products");

      if (isMounted) {
        setProducts(res.data);
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeFilter = () => {
    if (activeFilter === "price") {
      setActiveFilter("title");
    } else {
      setActiveFilter("price");
    }
  };

  return (
    <Layout>
      <Link href={"/products/new"} className="btn-primary">
        Add new product
      </Link>

      <button
        className="w-[100px] h-[30px] ml-4 bg-blue-600 text-white cursor-pointer"
        onClick={handleChangeFilter}
      >
        {`Filter: ${activeFilter}`}
      </button>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <table className="basic mt-2">
          <thead>
            <tr>
              <td>Product name</td>
              <td>Price per gram (฿)</td>
              <td>Strain</td>
              <td>Popular</td>
              <td>ShowProduct</td>
              <td></td>
            </tr>
          </thead>

          <tbody>
            {sortProducts().map((product) => (
              <tr key={product._id} className=" border-b border-gray-500">
                <td
                  onClick={() => router.push("/products/edit/" + product._id)}
                  className="cursor-pointer"
                >
                  {product.title}
                </td>

                <td>
                  {product.price.tier1Price}-{product.price.tier3Price}
                </td>

                <td>{product.properties.Type}</td>

                <td>{product.properties.Popular}</td>

                <td>{product.properties.ShowProduct}</td>

                <td>
                  <Link
                    className="btn-default"
                    href={"/products/edit/" + product._id}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Edit
                  </Link>
                  <Link
                    className="btn-red"
                    href={"/products/delete/" + product._id}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Delete
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default Products;
