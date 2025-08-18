const Category = require("../Models/Category");

class CategoriesController {
  async getCategories(req, res) {
    try {
      // Get sorting parameters from query string
      const { 
        sortBy = 'title', 
        sortOrder = 'asc',
        isActive 
      } = req.query;

      // Build the filter object
      const filter = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      // Define allowed sort fields for security
      const allowedSortFields = ['title', 'createdAt', 'updatedAt', 'isActive'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'title';
      
      // Define sort direction (1 for ascending, -1 for descending)
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      
      // Build sort object
      const sortObject = { [sortField]: sortDirection };

      const categories = await Category.find(filter).sort(sortObject);

      res.status(200).json({
        success: true,
        data: categories,
        message: "Categories fetched successfully",
        meta: {
          total: categories.length,
          sortBy: sortField,
          sortOrder: sortOrder,
          filter: filter
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Categories fetching error",
        error: error.message
      });
    }
  }

  async createCategory(req, res) {
    try {
      const { title, isActive,icon } = req.body;
      const newCategory = new Category({
        title,
        isActive,
        slug: title.toLowerCase().replace(/\s+/g, '-'), 
        icon: icon || "ArrowUpRight", // Default icon if not provided
      });
      await newCategory.save();

      res.status(201).json({
        success:true,
        data:newCategory,
        message: "Category created successfully",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Category Create Error",
        error: error.message,
      });
    }
  }

  async updateCategory(req,res){
    try{
        const {id} = req.params;
        const {title, isActive,icon} = req.body;
        if(!id){
            return res.status(400).json({
                success: false,
                message: "Category ID is required"
            });
        }
        const updateCategory = await Category.findByIdAndUpdate({
            _id: id
        }, {
            title,
            isActive,
            icon: icon || "ArrowUpRight",
            slug: title.toLowerCase().replace(/\s+/g, '-'), 
        }, {
            new: true,
            runValidators:true
        });

        res.status(200).json({
            success:true,
            data:updateCategory,
            message:"category Update Successfully"
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"Category Update Error"
        })
    }
  }

  async deleteCategory(req,res){
    try{
        const{id} = req.params;
        
        if(!id){
            return res.status(400).json({
                success: false,
                message: "Category ID is required"
            });
        }
        const deleteCategory = await Category.findByIdAndDelete({
            _id: id 
        });

        if(!deleteCategory){
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        res.status(200).json({
            success:true,
            message:"Category deleted successfully"
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Category Delete Error"
        });

    }
  }
}

module.exports = CategoriesController;
