"use client";

import BasicLayout from "@/components/BasicLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/firebaseConfig";

export default function DeleteProductPage({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState("");
  useEffect(() => {
    async function fetchData() {
      const res = await getDoc(doc(db, "products", params.id));
      setProduct(res.data());
    }
    fetchData();
  }, []);

  function goBack() {
    router.push("/products");
  }

  async function HandleSubmit() {
    try {
      await deleteDoc(doc(db, "products", params.id));
      router.push("/products");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <BasicLayout>
      <h1 className="text-center">
        Do you want to delete this product <b>{product.name}</b>?
      </h1>
      <div className="flex gap-2 justify-center">
        <button className="btn-red" onClick={HandleSubmit}>
          Yes
        </button>
        <button className="btn-default" onClick={goBack}>
          No
        </button>
      </div>
    </BasicLayout>
  );
}
