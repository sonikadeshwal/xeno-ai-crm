import mongoose, { Schema, Document } from "mongoose";

export interface ICommunicationLog extends Document {
  campaignId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerEmail: string;
  message: string;
  channel: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "OPENED" | "CLICKED";
  vendorMessageId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationLogSchema = new Schema<ICommunicationLog>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerEmail: { type: String },
    message: { type: String },
    channel: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "DELIVERED", "FAILED", "OPENED", "CLICKED"],
      default: "PENDING",
    },
    vendorMessageId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.CommunicationLog ||
  mongoose.model<ICommunicationLog>("CommunicationLog", CommunicationLogSchema);
