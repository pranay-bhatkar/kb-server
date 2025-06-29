import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      unique: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.ObjectId, ref: "product" },
        name: String,
        image: [String],
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      enum: ["Pending", "Paid via QR", "Cash on Delivery"], 
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
      required: true,
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },

    // NEW FIELDS
    deliveryType: {
      type: String,
      enum: ["instant", "schedule"],
      default: "instant",
    },
    subscriptionDetails: {
      startDate: Date,
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      nextDeliveryDate: Date,
    },
    deliverySlot: {
      type: String,
      enum: ["morning", "evening", "night", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
