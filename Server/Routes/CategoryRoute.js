const CategoriesController = require("../Controllers/Category");
const express = require("express");
const router = express.Router();
const categoriesController = new CategoriesController();

router.get("/", categoriesController.getCategories);
router.post("/", categoriesController.createCategory);
router.put("/:id", categoriesController.updateCategory);
router.delete("/:id", categoriesController.deleteCategory);

module.exports = router;