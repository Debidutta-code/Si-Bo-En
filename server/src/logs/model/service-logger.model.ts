import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepoCall {
  repoName: string;           
  method: string;             
  input?: Record<string, any>;
  response?: Record<string, any>;
  success: boolean;
  durationMs?: number;        
  error?: {
    message: string;
  };
}

export interface ILogMessage {
  text: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: Date;
  data?: Record<string, any>;
}

export interface IServiceLog extends Document {
  requestId: string;
  timestamp: Date;
  service: string;
  method: string;
  level: 'info' | 'warn' | 'error' | 'debug';

  incomingData?: Record<string, any>;

  repoCalls: IRepoCall[];

  messages: ILogMessage[];

  serviceResponse?: {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
    meta?: any;
    timestamp?: string;
    requestId?: string;
  };

  error?: {
    message: string;
    stack?: string;
    code?: string | number;
  };

  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RepoCallSchema = new Schema<IRepoCall>(
  {
    repoName:   { type: String, required: true },
    method:     { type: String, required: true },
    input:      { type: Schema.Types.Mixed, default: null },
    response:   { type: Schema.Types.Mixed, default: null },
    success:    { type: Boolean, required: true },
    durationMs: { type: Number,  default: null },
    error: {
      type: new Schema(
        {
          message: { type: String },
          stack:   { type: String },
          code:    { type: Schema.Types.Mixed },
        },
        { _id: false }
      ),
      default: null,
    },
  },
  { _id: false }
);

const LogMessageSchema = new Schema<ILogMessage>(
  {
    text:      { type: String, required: true },
    level:     { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
    timestamp: { type: Date,   default: () => new Date() },
    data:      { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);


const ServiceLogSchema = new Schema<IServiceLog>(
  {
    requestId: { type: String, required: true, index: true },
    timestamp: { type: Date,   required: true, default: () => new Date() },
    service:   { type: String, required: true, index: true },
    method:    { type: String, required: true },
    level:     { type: String, enum: ['info', 'warn', 'error', 'debug'], required: true, index: true },

    incomingData: { type: Schema.Types.Mixed, default: null },

    repoCalls: { type: [RepoCallSchema],  default: [] },
    messages:  { type: [LogMessageSchema], default: [] },

    serviceResponse: {
      type: new Schema(
        {
          success:   { type: Boolean },
          message:   { type: String },
          data:      { type: Schema.Types.Mixed },
          error:     { type: String },
          meta:      { type: Schema.Types.Mixed },
          timestamp: { type: String },
          requestId: { type: String },
        },
        { _id: false }
      ),
      default: null,
    },

    error: {
      type: new Schema(
        {
          message: { type: String },
          stack:   { type: String },
          code:    { type: Schema.Types.Mixed },
        },
        { _id: false }
      ),
      default: null,
    },

    meta: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    collection: 'service_logs',
  }
);

ServiceLogSchema.index({ requestId: 1, service: 1 });
ServiceLogSchema.index({ level: 1, timestamp: -1 });
ServiceLogSchema.index({ service: 1, method: 1, timestamp: -1 });
ServiceLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 15 });


export const ServiceLogModel: Model<IServiceLog> =
  mongoose.models.ServiceLog ||
  mongoose.model<IServiceLog>('ServiceLog', ServiceLogSchema);