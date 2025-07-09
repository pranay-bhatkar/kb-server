// import Stripe from "../config/stripe.js";
// import CartProductModel from "../models/cartproduct.model.js";
// import OrderModel from "../models/order.model.js";
// import UserModel from "../models/user.model.js";
// import mongoose from "mongoose";

//  export async function CashOnDeliveryOrderController(request,response){
//     try {
//         const userId = request.userId // auth middleware
//         const { list_items, totalAmt, addressId,subTotalAmt } = request.body

//         const payload = list_items.map(el => {
//             return({
//                 userId : userId,
//                 orderId : `ORD-${new mongoose.Types.ObjectId()}`,

//                 productId : el.productId._id,
//                 product_details : {
//                     name : el.productId.name,
//                     image : el.productId.image
//                 } ,
//                 paymentId : "",
//                 payment_status : "Cash on Delivery",
//                 delivery_address : addressId ,
//                 subTotalAmt  : subTotalAmt,
//                 totalAmt  :  totalAmt,
//             })
//         })

//         const generatedOrder = await OrderModel.insertMany(payload)

//         ///remove from the cart
//         const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
//         const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

//         return response.json({
//             message : "Order successfully",
//             error : false,
//             success : true,
//             data : generatedOrder
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error ,
//             error : true,
//             success : false
//         })
//     }
// }

// export const pricewithDiscount = (price,dis = 1)=>{
//     const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
//     const actualPrice = Number(price) - Number(discountAmout)
//     return actualPrice
// }

// export async function paymentController(request,response){
//     try {
//         const userId = request.userId // auth middleware
//         const { list_items, totalAmt, addressId,subTotalAmt } = request.body

//         const user = await UserModel.findById(userId)

//         const line_items  = list_items.map(item =>{
//             return{
//                price_data : {
//                     currency : 'inr',
//                     product_data : {
//                         name : item.productId.name,
//                         images : item.productId.image,
//                         metadata : {
//                             productId : item.productId._id
//                         }
//                     },
//                     unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100
//                },
//                adjustable_quantity : {
//                     enabled : true,
//                     minimum : 1
//                },
//                quantity : item.quantity
//             }
//         })

//         const params = {
//             submit_type : 'pay',
//             mode : 'payment',
//             payment_method_types : ['card'],
//             customer_email : user.email,
//             metadata : {
//                 userId : userId,
//                 addressId : addressId
//             },
//             line_items : line_items,
//             success_url : `${process.env.FRONTEND_URL}/success`,
//             cancel_url : `${process.env.FRONTEND_URL}/cancel`
//         }

//         const session = await Stripe.checkout.sessions.create(params)

//         return response.status(200).json(session)

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// const getOrderProductItems = async({
//     lineItems,
//     userId,
//     addressId,
//     paymentId,
//     payment_status,
//  })=>{
//     const productList = []

//     if(lineItems?.data?.length){
//         for(const item of lineItems.data){
//             const product = await Stripe.products.retrieve(item.price.product)

//             const paylod = {
//                 userId : userId,
//                 orderId : `ORD-${new mongoose.Types.ObjectId()}`,
//                 productId : product.metadata.productId,
//                 product_details : {
//                     name : product.name,
//                     image : product.images
//                 } ,
//                 paymentId : paymentId,
//                 payment_status : payment_status,
//                 delivery_address : addressId,
//                 subTotalAmt  : Number(item.amount_total / 100),
//                 totalAmt  :  Number(item.amount_total / 100),
//             }

//             productList.push(paylod)
//         }
//     }

//     return productList
// }

// //http://localhost:8080/api/order/webhook
// export async function webhookStripe(request,response){
//     const event = request.body;
//     const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

//     console.log("event",event)

//     // Handle the event
//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object;
//       const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
//       const userId = session.metadata.userId
//       const orderProduct = await getOrderProductItems(
//         {
//             lineItems : lineItems,
//             userId : userId,
//             addressId : session.metadata.addressId,
//             paymentId  : session.payment_intent,
//             payment_status : session.payment_status,
//         })

//       const order = await OrderModel.insertMany(orderProduct)

//         console.log(order)
//         if(Boolean(order[0])){
//             const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
//                 shopping_cart : []
//             })
//             const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
//         }
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a response to acknowledge receipt of the event
//   response.json({received: true});
// }

// export async function getOrderDetailsController(request,response){
//     try {
//         const userId = request.userId // order id

//         const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

//         return response.json({
//             message : "order list",
//             data : orderlist,
//             error : false,
//             success : true
//         })
//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// // Get Order History for a User
// export const getOrderHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Find orders for the given user, populate product & address details
//     const orders = await OrderModel.find({ userId })
//       .populate("items.productId") // Populate product details
//       .populate("delivery_address") // Populate delivery address
//       .sort({ createdAt: -1 }); // Sort by latest order first

//     if (!orders.length) {
//       return res.status(404).json({ message: "No orders found" });
//     }

//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching order history:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

// Utility: calculate discounted price
export const pricewithDiscount = (price, dis = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);
  return Number(price) - discountAmount;
};

// Cash on Delivery Order
export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId;
    const {
      list_items,
      totalAmt,
      addressId,
      subTotalAmt,
      deliveryType,
      deliverySlot,
      subscriptionDetails,
      transactionId,
      payment_status = "Cash on Delivery", // default to COD if not provided
    } = request.body;

    const items = list_items.map((el) => ({
      productId: el.productId._id,
      name: el.productId.name,
      image: el.productId.image,
      quantity: el.quantity,
      price: el.productId.price,
    }));

    // Referral reward logic
    const user = await UserModel.findById(userId);
    if (user?.referredBy && !user?.hasUsedReferral) {
      const referrer = await UserModel.findOne({
        referralCode: user.referredBy,
      });

      if (referrer) {
        referrer.rewardWallet += 50; // Reward for referrer
        user.rewardWallet += 25; // Reward for new user
        user.hasUsedReferral = true;

        await referrer.save();
        await user.save();

        console.log("Referral reward applied (COD).");
      }
    }

    const order = await OrderModel.create({
      userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,
      items,
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
      paymentId: transactionId || "",
      payment_status,
      deliveryType: deliveryType || "instant",
      deliverySlot: deliverySlot || null, // ✅ NEW
      subscriptionDetails: subscriptionDetails || null,
    });

    console.log("Creating Order With:", {
      userId,
      deliveryType,
      deliverySlot,
      payment_status,
    });

    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return response.json({
      message: "Order placed successfully",
      error: false,
      success: true,
      data: order,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Stripe payment session creation
export async function paymentController(request, response) {
  try {
    const userId = request.userId;
    const {
      list_items,
      totalAmt,
      addressId,
      subTotalAmt,
      deliveryType,
      subscriptionDetails,
    } = request.body;

    const user = await UserModel.findById(userId);

    const line_items = list_items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name,
          images: item.productId.image,
          metadata: {
            productId: item.productId._id,
          },
        },
        unit_amount:
          pricewithDiscount(item.productId.price, item.productId.discount) *
          100,
      },
      adjustable_quantity: { enabled: true, minimum: 1 },
      quantity: item.quantity,
    }));

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId,
        addressId,
        deliveryType: deliveryType || "instant",
        subscriptionDetails: subscriptionDetails
          ? JSON.stringify(subscriptionDetails)
          : null,
      },
      line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);
    return response.status(200).json(session);
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Stripe webhook handler
export async function webhookStripe(request, response) {
  try {
    const event = request.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(
        session.id
      );

      const items = [];
      for (const item of lineItems.data) {
        const product = await Stripe.products.retrieve(item.price.product);
        items.push({
          productId: product.metadata.productId,
          name: product.name,
          image: product.images,
          quantity: item.quantity,
          price: item.amount_total / 100,
        });
      }

      // Referral reward logic
      const user = await UserModel.findById(session.metadata.userId);
      if (user?.referredBy && !user?.hasUsedReferral) {
        const referrer = await UserModel.findOne({
          referralCode: user.referredBy,
        });

        if (referrer) {
          referrer.rewardWallet += 50; // Reward for referrer
          user.rewardWallet += 25; // Reward for new user
          user.hasUsedReferral = true;

          await referrer.save();
          await user.save();

          console.log("Referral reward applied (Stripe).");
        }
      }

      const order = await OrderModel.create({
        userId: session.metadata.userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        items,
        delivery_address: session.metadata.addressId,
        subTotalAmt: Number(session.amount_subtotal / 100),
        totalAmt: Number(session.amount_total / 100),
        paymentId: session.payment_intent,
        payment_status: session.payment_status,
        deliveryType: session.metadata.deliveryType || "instant",
        subscriptionDetails: session.metadata.subscriptionDetails
          ? JSON.parse(session.metadata.subscriptionDetails)
          : null,
      });

      await CartProductModel.deleteMany({ userId: session.metadata.userId });
      await UserModel.updateOne(
        { _id: session.metadata.userId },
        { shopping_cart: [] }
      );

      console.log("Order saved:", order);
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    response
      .status(500)
      .json({ received: false, error: error.message || error });
  }
}

// Get current user's orders
export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;
    const orderlist = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address")
      .populate("items.productId");

    return response.json({
      message: "Order list",
      data: orderlist,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Get order history by userId
export const getOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await OrderModel.find({ userId })
      .populate("items.productId")
      .populate("delivery_address")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
