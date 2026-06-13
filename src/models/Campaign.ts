import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  segmentId: mongoose.Types.ObjectId;
  message: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP";
  status: "draft" | "sent" | "completed";
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  };
  aiInsights?: string;
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  segmentId: { type: Schema.Types.ObjectId, ref: "Segment" },
  message: { type: String, required: true },
  channel: { type: String, enum: ["EMAIL", "SMS", "WHATSAPP"], default: "EMAIL" },
  status: { type: String, enum: ["draft", "sent", "completed"], default: "draft" },
  stats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
  },
  aiInsights: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
