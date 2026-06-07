import { Router } from "express";
import { insertVector, deleteVector } from "../controllers/vectorController.ts"
import { searchVectors,searchHybrid,queryFilterRoute,searchByIdRoute, searchFullText } from "../controllers/milvusController.ts";
import {createMilvusCollection,listCollections,describeCollection,dropCollection} from "../controllers/collectionController.ts"
import {dropMilvusIndex,listMilvusIndexes,createMilvusIndex} from "../controllers/indexController.ts"

const router = Router();


router.post("/insert", insertVector); //Ruta radi 
router.post("/search", searchVectors);  //Ruta radi   //Postoji na frontendu
router.post("/getById", searchByIdRoute); //Ruta radi 
router.post("/query", queryFilterRoute);  //Ruta radi //Postoji na frontendu 
router.post("/hybrid-search",searchHybrid); 
router.delete("/delete/:collectionName/:id", deleteVector); // Ruta radi 
router.post("/fulltext",searchFullText)

router.post("/collection", createMilvusCollection); //Ruta radi    //Postoji na frontendu
router.get("/collections", listCollections); //Ruta radi   //Postoji na frontendu
router.get("/collections/:name", describeCollection);//Ruta radi    //Postoji na frontendu
router.delete("/collection/:name", dropCollection); //Ruta radi    //Postoji na frontendu

router.post("/index",createMilvusIndex ); //Ruta radi    //Postoji na frontendu
router.delete("/index/:collectionName/:indexName",dropMilvusIndex);//Ruta radi    //Postoji na frontendu
router.post("/indexes", listMilvusIndexes); //Ruta radi    //Postoji na frontendu

export default router;