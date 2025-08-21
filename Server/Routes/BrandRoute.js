const { BrandsController, upload } = require("../Controllers/Brand");
const express = require("express");
const router = express.Router();
const brandsController = new BrandsController();

router.get("/", brandsController.getBrands);
router.get("/category/:categoryId", brandsController.getBrandsByCategory);
router.post("/", upload.any(), brandsController.createBrand);
router.put("/:id", upload.any(), brandsController.updateBrand);
router.delete("/:id", brandsController.deleteBrand);

module.exports = router;