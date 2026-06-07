// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import recipeRoutes from "./routes/recipeRoutes.ts";
// import milvusRoutes from "./routes/milvusRoutes.ts";
// ////import collectionRoutes from "./routes/collectionRoutes.ts";

// dotenv.config();


// const app = express();
// app.use(cors());
// app.use(express.json());

// console.log("Server je pokrenut");
// // Registrujemo rute
// app.use("/api/recipes", recipeRoutes);
// app.use('/api/milvus', milvusRoutes);
// //app.use('/app/collections', collectionRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

// // Health check
// app.get('/health', (_req, res) => res.send('Server is healthy!'));

// export default app;
