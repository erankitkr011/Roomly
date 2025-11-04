const notificationSchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The sender of the notification
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Bill", "Payment", "System", "Reminder", "Alert"],
      default: "System",
    },
    targetTenants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // All tenants who should see the notification
      },
    ],
    isReadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Tenants who have already read the notification
      },
    ],
  },
  { timestamps: true }
);
