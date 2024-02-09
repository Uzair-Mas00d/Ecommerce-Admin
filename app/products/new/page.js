"use client";

import BasicLayout from "@/components/BasicLayout";
import { db, storage } from "@/app/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function addDataToFireStore(
  name,
  description,
  price,
  photoUrl,
  category,
  productProperties
) {
  try {
    const res = await addDoc(collection(db, "products"), {
      name: name,
      description: description,
      price: price,
      photoUrl: photoUrl,
      category: category,
      properties: productProperties,
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
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

export default function NewProduct() {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCaregory] = useState("");
  const [categories, setCategories] = useState([]);
  const [productProperties, setProductProperties] = useState({});

  useEffect(() => {
    async function fetchData() {
      const data = await getDataFromFireStore();
      setCategories(data);
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await addDataToFireStore(
      name,
      description,
      price,
      photoUrl,
      category,
      productProperties
    );
    if (res) {
      setName("");
      setDescription("");
      setPrice("");
      setPhotoUrl("");
      setCaregory("");
      setProductProperties({});

      router.push("/products");
    }
  };

  async function uploadImages(e) {
    const image = e.target.files[0];
    if (image === "" || image === undefined) {
      alert("Please select an image");
      return;
    }
    const fileRef = ref(storage, `products/${image.name}`);
    uploadBytes(fileRef, image).then((data) => {
      getDownloadURL(data.ref).then((url) => {
        setPhotoUrl([...photoUrl, url]);
      });
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ id }) => id == category.split(" ")[1]);
    catInfo.properties ? propertiesToFill.push(...catInfo.properties) : "";

    while (catInfo?.parentCategory) {
      const parentCat = categories.find(
        ({ id }) => id == catInfo?.parentCategory.split(" ")[1]
      );
      parentCat.properties
        ? propertiesToFill.push(...parentCat.properties)
        : "";
      catInfo = parentCat;
    }
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      console.log(newProductProps);
      return newProductProps;
    });
  }

  return (
    <BasicLayout>
      <h1>New Product</h1>
      <form onSubmit={handleSubmit}>
        <label>Product name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="product name"
        />
        <label>Category</label>
        <select value={category} onChange={(e) => setCaregory(e.target.value)}>
          <option value="">Uncategorized</option>
          {categories.length > 0 &&
            categories.map((c) => (
              <option key={c.id} value={`${c.name} ${c.id}`}>
                {c.name}
              </option>
            ))}
        </select>
        {propertiesToFill.length > 0 &&
          propertiesToFill.map((p, index) => (
            <div className="" key={index}>
              <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
              <div>
                <select
                  value={productProperties[p.name]}
                  onChange={(e) => setProductProp(p.name, e.target.value)}
                >
                  {p.values.map((v, index) => (
                    <option value={v} key={index}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

        <label>Photos</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {!!photoUrl?.length &&
            photoUrl.map((link) => (
              <div key={link} className="inline-block h-24 p-4 shadow-sm rounded-sm border border-gray-200">
                <img src={link} alt="" className="rounded-lg" />
              </div>
            ))}
          <label className="w-24 h-24 text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm cursor-pointer bg-white shadow-sm border border-primary">
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
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <div>Add image</div>
            <input
              type="file"
              accept="image/gif, image/jpeg, image/png"
              onChange={uploadImages}
              className="hidden"
            />
          </label>
        </div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="description"
        ></textarea>
        <label>Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="price"
        />
        <button type="submit" className="btn-primary">
          Save
        </button>
      </form>
    </BasicLayout>
  );
}
