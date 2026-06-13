import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  totalSpend: number;
  visitCount: number;
  lastVisit: Date;
  tags: string[];
  churnRisk: "High" | "Medium" | "Low" | "Unknown";
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  totalSpend: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
  lastVisit: { type: Date },
  tags: [{ type: String }],
  churnRisk: { type: String, enum: ["High", "Medium", "Low", "Unknown"], default: "Unknown" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
