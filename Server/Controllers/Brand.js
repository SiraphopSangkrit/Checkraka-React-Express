const Brand = require("../Models/Brand");

class BrandsController {
  async getBrands(req, res) {
    try {
      const { sortBy = "name", sortOrder = "asc", isActive } = req.query;

      // Build the filter object
      const filter = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      // Define allowed sort fields for security
      const allowedSortFields = [
        "name",
        "nameTH",
        "createdAt",
        "updatedAt",
        "isActive",
      ];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";

      // Define sort direction (1 for ascending, -1 for descending)
      const sortDirection = sortOrder === "desc" ? -1 : 1;

      // Build sort object
      const sortObject = { [sortField]: sortDirection };

      const brands = await Brand.find(filter).sort(sortObject).populate('categories.category').exec();

      res.status(200).json({
        success: true,
        data: brands,
        message: "Brands fetched successfully",
        meta: {
          total: brands.length,
          sortBy: sortField,
          sortOrder: sortOrder,
          filter: filter,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Brands fetching error",
        error: error.message,
      });
    }
  }

  async createBrand(req, res) {
    try {
      const { name, nameTH, isActive, categories } = req.body;
      const newBrand = new Brand({
        name,
        nameTH,
        isActive,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        categories: categories?.map((cat) => ({
          category: cat.category, // ObjectId of the category
          logo: cat.logo || "https://placehold.co/600x400.png", // Default logo if not provided
          isActive: cat.isActive !== undefined ? cat.isActive : true, // Default to true if not provided
        })),
      });
      await newBrand.save();

      res.status(201).json({
        success: true,
        data: newBrand,
        message: "Brand created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Brand creation error",
        error: error.message,
      });
    }
  }

  async updateBrand(req, res) {
    try {
      const { id } = req.params;
      const { name, nameTH, isActive, categories } = req.body;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Brand ID is required",
        });
      }
      const updateBrand = await Brand.findByIdAndUpdate(
        { _id: id },
        {
          name,
          nameTH,
          isActive,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          categories: categories.map((cat) => ({
            category: cat.category,
            logo: cat.logo || "https://placehold.co/600x400.png", // Default logo if not provided
            isActive: cat.isActive !== undefined ? cat.isActive : true, // Default to true if not provided
          })),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(202).json({
        success: true,
        data: updateBrand,
        message: "Brand updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Brand Update Failed",
        error: error.message,
      });
    }
  }

  async deleteBrand(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Brand ID is required",
        });
      }
      const deletedBrand = await Brand.findByIdAndDelete(id);
      if (!deletedBrand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Brand deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Brand Delete Failed",
        error: error.message,
      });
    }
  }
}

module.exports = BrandsController;
