import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

export interface ICategory {
  _id: string;
  name: string;
  parent: any;
  properties: IProperty[];
}

type NullableCategory = null | ICategory;

interface ICategoriesProps {
  swal: any;
}

interface ISwalResult {
  isConfirmed: boolean;
}

interface IProperty {
  id: string;
  name: string;
  values: string;
}

const Categories = ({ swal }: ICategoriesProps) => {
  const [loading, setLoading] = useState(false);
  const [editedCategory, setEditedCategory] = useState<NullableCategory>(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [properties, setProperties] = useState<IProperty[]>([]);

  const fetchCategories = async () => {
    setLoading(true);

    const res = await axios.get("/api/categories");

    setCategories(res.data);
    setLoading(false);
  };

  const cancelEditing = () => {
    setName("");
    setEditedCategory(null);
    setParentCategory("");
    setProperties([]);
  };

  const saveCategory = async (e: any) => {
    e.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
        id: p.id,
      })),
    };

    if (editedCategory) {
      await axios.put("/api/categories", { ...data, _id: editedCategory._id });
    } else {
      await axios.post("/api/categories", data);
    }

    cancelEditing();
    fetchCategories();
  };

  const editCategory = (category: ICategory) => {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values, id }) => ({
        name,
        // @ts-ignore
        values: values.join(","),
        id,
      }))
    );
  };

  const deleteCategory = (category: ICategory) => {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (res: ISwalResult) => {
        if (res.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      });
  };

  const addProperty = () => {
    setProperties((prev) => {
      return [
        ...prev,
        { name: "", values: "", id: Math.random().toString(36).substr(2, 8) },
      ];
    });
  };

  const removeProperty = (index: number) => {
    setProperties((prev) => {
      return [...prev].filter((_, propertyIndex) => propertyIndex !== index);
    });
  };

  const handlePropertyNameChange = (index: number, newName: string) => {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  };

  const handlePropertyValuesChange = (index: number, newValues: string) => {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Layout>
      <h1>Categories</h1>

      <label>
        {editedCategory
          ? `Edit Category ${editedCategory.name}`
          : "New Category name"}
      </label>

      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={"Category name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Parent categories */}
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="block">Properties</label>

          <button
            type="button"
            className="btn-default text-sm mb-2"
            onClick={addProperty}
          >
            Add new property
          </button>

          {properties.length > 0 &&
            properties.map((property, index) => (
              <div key={property.id} className="flex gap-1 mb-2">
                <input
                  type="text"
                  className="mb-0"
                  placeholder="property name (example: grams)"
                  value={property.name}
                  onChange={(e) =>
                    handlePropertyNameChange(index, e.target.value)
                  }
                />

                <input
                  type="text"
                  className="mb-0"
                  placeholder="values, comma separated"
                  value={property.values}
                  onChange={(e) =>
                    handlePropertyValuesChange(index, e.target.value)
                  }
                />

                <button
                  type="button"
                  className="btn-red"
                  onClick={() => removeProperty(index)}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>

        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              className="btn-default py-1"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          )}

          <button type="submit" className="btn-primary py-1">
            Save
          </button>
        </div>
      </form>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        !editedCategory && (
          <table className="basic mt-4">
            <thead>
              <tr>
                <td>Category name</td>
                <td>Parent category</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 &&
                categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category?.parent?.name}</td>
                    <td>
                      <div className="flex">
                        <button
                          className="btn-default mr-1"
                          onClick={() => editCategory(category)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-red"
                          onClick={() => deleteCategory(category)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )
      )}
    </Layout>
  );
};

export default withSwal(({ swal }: ICategoriesProps) => (
  <Categories swal={swal} />
));
