// Model: UserWorkspace.js
const snippetSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Heart Rate Alert"
    blockData: { type: Object, required: true }, // The JSON of specific blocks
    createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    snippets: [snippetSchema]
});