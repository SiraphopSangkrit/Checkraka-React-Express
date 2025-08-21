const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nameTH: {
      type: String,
    },
    slug: {
      type: String,
    },
   
    categories: [{
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
        logo: {
          type: String,
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }]
  },
  
  {
    timestamps: true,
  }
);

brandSchema.methods.getLogoForCategory = function(categoryId) {
    const categoryEntry = this.categories.find(cat => 
      cat.category.toString() === categoryId.toString()
    );
    return categoryEntry ? categoryEntry.logo : this.logo;
  };
  
  brandSchema.methods.addCategoryWithLogo = function(categoryId, logoUrl) {
    this.categories.push({
      category: categoryId,
      logo: logoUrl
    });
  };
  
  brandSchema.methods.updateCategoryLogo = function(categoryId, newLogoUrl) {
    const categoryEntry = this.categories.find(cat => 
      cat.category.toString() === categoryId.toString()
    );
    if (categoryEntry) {
      categoryEntry.logo = newLogoUrl;
    }
  };

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;

