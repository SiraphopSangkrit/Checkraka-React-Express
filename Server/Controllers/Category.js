const Category = require("../Models/Category");

class CategoriesController {
  async getCategories(req, res) {
    try {
      const categories = await Category.find();

      res.status(200).json({
        success: true,
        data: categories,
        message: "Categories fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Categories fetching error",
      });
    }
  }
  async createCategory(req, res) {
    try {
      const { title, isActive } = req.body;
      const newCategory = new Category({
        title,
        isActive,
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
        const {title, isActive} = req.body;
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
            isActive
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
