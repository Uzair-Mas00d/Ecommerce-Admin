"use client";

import BasicLayout from "@/components/BasicLayout";
import { useEffect, useState } from "react";
import { db } from "@/app/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

async function getDataFromFireStore() {
  try {
    const snapShot = await getDocs(collection(db, "orders"));
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

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const data = await getDataFromFireStore();
      setOrders(data);
    }
    fetchData();
  }, []);

  async function deliverOrder(order) {
    try {
      const ref = doc(db, "orders", order.id);
      await updateDoc(ref, {
        ...order,
        deliver: "deliver",
      });
      const data = await getDataFromFireStore();
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function cancleOrder(order) {
    try {
      const ref = doc(db, "orders", order.id);
      await updateDoc(ref, {
        ...order,
        deliver: "cancel",
      });
      const data = await getDataFromFireStore();
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <BasicLayout>
      <h1>Orders</h1>
      <table className="basic">
        <thead>
          <tr>
            <th>Date</th>
            <th>Delivery status</th>
            <th>Recipient</th>
            <th>Products</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 &&
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.createdAt}</td>
                <td>{order.deliver}</td>
                <td>
                  {order.name} {order.email}
                  <br />
                  {order.phone}
                  <br />
                  {order.city} {order.postalCode}
                  <br />
                  {order.address}
                </td>
                <td>
                  {order.products.map((product) => (
                    <span key={product.productId}>
                      {product.productName} x {product.productQuantity}
                      <br />
                    </span>
                  ))}
                </td>
                <td>{order.totalPrice}</td>
                <td>
                  <button
                    onClick={() => deliverOrder(order)}
                    className="btn-primary mx-1"
                  >
                    Deliver
                  </button>
                  <button
                    onClick={() => cancleOrder(order)}
                    className="btn-default mt-2"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </BasicLayout>
  );
}
