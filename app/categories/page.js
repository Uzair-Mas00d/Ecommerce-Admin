"use client";

import BasicLayout from "@/components/BasicLayout";
import { useState, useEffect } from "react";
import { db } from "@/app/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { withSwal } from "react-sweetalert2";

async function addDataToFireStore(name, parentCategory, editedCategory, properties) {
  if (editedCategory) {
    const ref = doc(db, "categories", editedCategory.id);
    console.log();
    await updateDoc(ref, {
      name: name,
      parentCategory: parentCategory,
      properties: properties.map(p=>({
        name:p.name,
        values:p.values.split(',')
      })),

    });
    return true;
  } else {
    try {
      const res = await addDoc(collection(db, "categories"), {
        name: name,
        parentCategory: parentCategory,
        properties: properties.map(p=>({
          name:p.name,
          values:p.values.split(',')
        })),
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

async function getDataFromFireStore() {
  try {
    const snapShot = await getDocs(collection(db, "categories"));
    const data = [];
    snapShot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [categories, setCategories] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [properties, setPorperties] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getDataFromFireStore();
      setCategories(data);
    }
    fetchData();
  }, [categories]);

  async function saveCategory(e) {
    e.preventDefault();
    const res = await addDataToFireStore(name, parentCategory, editedCategory,properties);
    if (res) {
      setName("");
      setParentCategory("");
      setEditedCategory(null);
      setPorperties([]);
    }
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parentCategory);
    setPorperties(category.properties ? category.properties.map(({name, values})=>(
      { name, values:values.join(', ') }
    )) : []);
  }

  function deleteCategory(category) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}`,
        showCancelButton: true,
        cancelButtonText: "Cancle",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          deleteDoc(doc(db, "categories", category.id));
        }
      });
  }

  function addProperty() {
    setPorperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setPorperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setPorperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(index) {
    setPorperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== index;
      });
    });
  }

  return (
    <BasicLayout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create new category name"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option
                  key={category.id}
                  value={`${category.name} ${category.id}`}
                >
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            type="button"
            onClick={addProperty}
            className="btn-default text-sm mb-2"
          >
            Add a new property
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div className="flex gap-1 mb-2" key={index}>
                <input
                  type="text"
                  className="mb-0"
                  value={property.name}
                  onChange={(e) =>
                    handlePropertyNameChange(index, property, e.target.value)
                  }
                  placeholder="property name (example: color)"
                />
                <input
                  type="text"
                  className="mb-0"
                  value={property.values}
                  onChange={(e) =>
                    handlePropertyValuesChange(index, property, e.target.value)
                  }
                  placeholder="values, comma separated"
                />
                <button
                  type="button"
                  onClick={() => removeProperty(index)}
                  className="btn-red"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">

        { editedCategory && (
          <button 
          type="button"
            onClick={()=>{ setEditedCategory(null)
              setName('')
              setParentCategory('')
              setPorperties([])
            }}
          className="btn-default">Cancel</button>
        ) }
        <button type="submit" className="btn-primary py-1">
          Save
        </button>
        </div>
      </form>

      {!editedCategory && (

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
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.parentCategory?.split(" ")[0]}</td>
                <td>
                  <button
                    onClick={() => editCategory(category)}
                    className="btn-default mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="btn-red"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      )}
    </BasicLayout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
