import {
  addToFavourite,
  createProduct,
  deleteproduct,
  exportProductToCSV,
  filterProductsSearch,
  getAllProducts,
  getProductById,
  getUserFavorites,
  setHotProduct,
  sortProducts,
  toggleFeaturedProduct,
  toggleProductStock,
  totalNumberOfProducts,
  updateProduct,
} from "#/controller/product";
import { isAdmin, mustAuth } from "#/middleware/user";
import { validate } from "#/middleware/validator";
// import { productValidation } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.get("/products", getAllProducts);
router.get("/user-fav", mustAuth, getUserFavorites);
router.get("/:productId", getProductById);
router.post("/create-product", createProduct);
router.post("/add-to-fav", mustAuth, addToFavourite);
router.patch("/:productId", mustAuth, isAdmin, updateProduct);
router.delete("/:productId", mustAuth, isAdmin, deleteproduct);
router.get("/total/products", mustAuth, isAdmin, totalNumberOfProducts)
router.post("/stock", mustAuth, isAdmin, toggleProductStock)
router.get("/export/csv", exportProductToCSV)
router.get("/filter/search", filterProductsSearch)
router.get("/sort/search", sortProducts)
router.post("/isFeatured", toggleFeaturedProduct)
router.post("/isHot", setHotProduct)

export default router;
