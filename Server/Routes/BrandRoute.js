const BrandsController = require("../Controllers/Brand");
const express = require("express");
const router = express.Router();
const brandsController = new BrandsController();

router.get("/", brandsController.getBrands);
router.post("/", brandsController.createBrand);
router.put("/:id", brandsController.updateBrand);
router.delete("/:id", brandsController.deleteBrand);

module.exports = router;