import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  type?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface ICustomer extends Document {
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  status: 'Active' | 'Blocked';
  addresses: IAddress[];
  refreshToken?: string;
  orders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
  type: { type: String, default: 'Home' },
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

const CustomerSchema = new Schema<ICustomer>({
  firstName: { type: String },
  lastName: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' },
  addresses: [AddressSchema],
  refreshToken: { type: String },
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
}, { timestamps: true });

CustomerSchema.pre('save', async function (this: ICustomer) {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

CustomerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
