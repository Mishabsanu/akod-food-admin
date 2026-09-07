import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVariant {
  name: string;
  unit: string;
  purchasePrice?: number;
  sellingPrice?: number;
  wholesalePrice?: number;
  offerPrice?: number;
  stock?: number;
  openingStock?: number;
  minStockAlert?: number;
  sku?: string;
  barcode?: string;
  batchNumber?: string;
}

export interface IReview {
  customer?: mongoose.Types.ObjectId;
  customerName?: string;
  rating: number;
  comment: string;
  isVerified?: boolean;
  createdAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  sku?: string;
  category: mongoose.Types.ObjectId;
  subCategory?: string;
  brandName?: string;
  productType?: 'Veg' | 'Organic' | 'Homemade' | 'Premium';
  taxGst?: number;
  unitType?: 'Kg' | 'Gram' | 'Packet' | 'Bottle' | 'Box';
  netWeight?: string;
  grossWeight?: string;
  packingType?: 'Pouch' | 'Jar' | 'Box';
  piecesPerBox?: number;
  ingredients?: string;
  nutritionalInfo?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
  };
  shelfLife?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  storageInstructions?: string;
  allergyInfo?: string;
  supplierName?: string;
  supplierContact?: string;
  origin?: string;
  images: string[];
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  deliveryAvailable?: boolean;
  codAvailable?: boolean;
  returnAvailable?: boolean;
  status: 'Active' | 'Inactive';
  flavor?: string;
  instagramVideoUrl?: string;
  videoUrl?: string;
  oilTypeUsed?: string;
  dietType?: 'Vegan' | 'Gluten Free' | 'Keto Friendly' | 'None';
  certification?: string;
  variants: IVariant[];
  reviews: IReview[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  unit: { type: String, required: true, default: 'g' },
  purchasePrice: { type: Number },
  sellingPrice: { type: Number },
  wholesalePrice: { type: Number },
  offerPrice: { type: Number },
  stock: { type: Number, default: 0 },
  openingStock: { type: Number, default: 0 },
  minStockAlert: { type: Number, default: 5 },
  sku: { type: String },
  barcode: { type: String },
  batchNumber: { type: String }
});

const ReviewSchema = new Schema<IReview>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String },
  brandName: { type: String },
  productType: { type: String, enum: ['Veg', 'Organic', 'Homemade', 'Premium'], default: 'Veg' },
  taxGst: { type: Number },
  unitType: { type: String, enum: ['Kg', 'Gram', 'Packet', 'Bottle', 'Box'], default: 'Packet' },
  netWeight: { type: String }, 
  grossWeight: { type: String },
  packingType: { type: String, enum: ['Pouch', 'Jar', 'Box'], default: 'Pouch' },
  piecesPerBox: { type: Number },
  ingredients: { type: String },
  nutritionalInfo: {
    calories: { type: String },
    protein: { type: String },
    fat: { type: String },
    carbohydrates: { type: String }
  },
  shelfLife: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
  storageInstructions: { type: String },
  allergyInfo: { type: String },
  supplierName: { type: String },
  supplierContact: { type: String },
  origin: { type: String, default: 'India' },
  images: [{ type: String }],
  shortDescription: { type: String },
  fullDescription: { type: String },
  tags: [{ type: String }],
  deliveryAvailable: { type: Boolean, default: true },
  codAvailable: { type: Boolean, default: true },
  returnAvailable: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  flavor: { type: String },
  instagramVideoUrl: { type: String },
  videoUrl: { type: String },
  oilTypeUsed: { type: String },
  dietType: { type: String, enum: ['Vegan', 'Gluten Free', 'Keto Friendly', 'None'], default: 'None' },
  certification: { type: String },
  variants: [VariantSchema],
  reviews: [ReviewSchema],
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
