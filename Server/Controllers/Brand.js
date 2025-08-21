const Brand = require("../Models/Brand");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to delete S3 objects
async function deleteS3Object(s3Key) {
  if (!useS3 || !s3Key) return;
  
  try {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`Successfully deleted S3 object: ${s3Key}`);
  } catch (error) {
    console.error(`Error deleting S3 object ${s3Key}:`, error);
  }
}

// Helper function to extract S3 key from URL
function extractS3KeyFromUrl(url) {
  if (!url || !url.includes('amazonaws.com')) return null;
  
  try {
    const urlParts = url.split('/');
    const keyIndex = urlParts.findIndex(part => part.includes('amazonaws.com')) + 1;
    return urlParts.slice(keyIndex).join('/');
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
}

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/brands');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for local storage (fallback when S3 is not configured)
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const categoryId = file.fieldname.replace('categoryLogo_', '');
    const fileName = `${categoryId}-${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

// Try to use S3 if credentials are available, otherwise use local storage
let storage = localStorage;
let useS3 = false;
let s3Client = null; // Declare s3Client here

try {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
    const { S3Client } = require('@aws-sdk/client-s3');
    const multerS3 = require('multer-s3');
    
    // Configure AWS S3 Client (v3)
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Configure multer for S3 upload
    storage = multerS3({
      s3: s3Client,
      bucket: process.env.S3_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const categoryId = file.fieldname.replace('categoryLogo_', '');
        const fileName = `brands/logos/${categoryId}/${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      }
    });
    useS3 = true;
    console.log('Using S3 storage for file uploads (AWS SDK v3)');
  } else {
    console.log('AWS credentials not found, using local storage for file uploads');
  }
} catch (error) {
  console.log('S3 configuration failed, using local storage:', error.message);
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
      const allowedSortFields = ["name", "nameTH", "createdAt", "updatedAt"];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";

      // Create sort object
      const sort = {};
      sort[sortField] = sortOrder === "desc" ? -1 : 1;

      const brands = await Brand.find(filter)
        .populate('categories.category', 'title')
        .sort(sort);

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

  // Get brands by specific category (only active ones in that category)
  async getBrandsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { sortBy = "name", sortOrder = "asc" } = req.query;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
      }

      // Define allowed sort fields for security
      const allowedSortFields = ["name", "nameTH", "createdAt", "updatedAt"];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";

      // Create sort object
      const sort = {};
      sort[sortField] = sortOrder === "desc" ? -1 : 1;

      // Find brands that have this category and are active in this category
      const brands = await Brand.find({
        "categories.category": categoryId,
        "categories.isActive": true
      })
      .populate('categories.category', 'title')
      .sort(sort);

      // Filter to only return the logo for the requested category
      const brandsWithCategoryLogo = brands.map(brand => {
        const categoryEntry = brand.categories.find(cat => 
          cat.category._id.toString() === categoryId && cat.isActive
        );
        
        return {
          _id: brand._id,
          name: brand.name,
          nameTH: brand.nameTH,
          slug: brand.slug,
          logo: categoryEntry ? categoryEntry.logo : null,
          categoryInfo: categoryEntry ? categoryEntry.category : null,
          createdAt: brand.createdAt,
          updatedAt: brand.updatedAt
        };
      });

      res.status(200).json({
        success: true,
        data: brandsWithCategoryLogo,
        message: "Brands for category fetched successfully",
        meta: {
          total: brandsWithCategoryLogo.length,
          categoryId: categoryId,
          sortBy: sortField,
          sortOrder: sortOrder,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching brands by category",
        error: error.message,
      });
    }
  }

  async createBrand(req, res) {
    try {
   console.log("Request body:", req);
      console.log("Request body:", req.body);
      console.log("Request files:", req.files);
      console.log("Content-Type:", req.headers['content-type']);
      
      // Check if req.body exists and has data
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Request body is missing or empty. Make sure you're sending FormData with proper fields.",
        });
      }

      // Extract and validate name field
      const name = req.body.name;
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Brand name is required and cannot be empty",
        });
      }

      // Extract other fields with defaults
      const nameTH = req.body.nameTH || '';
      const isActive = req.body.isActive !== undefined ? req.body.isActive === 'true' : true;
      
      // Parse categories if provided
      let categories = [];
      if (req.body.categories) {
        try {
          categories = typeof req.body.categories === 'string' 
            ? JSON.parse(req.body.categories) 
            : req.body.categories;
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: "Invalid categories format. Must be valid JSON.",
            error: parseError.message
          });
        }
      }
      
      console.log("Parsed categories:", categories);
      console.log("Received files:", req.files);
      
      // Handle uploaded files for each category
      const categoriesWithLogos = categories.map(cat => {
        const logoFile = req.files && req.files.find(file => 
          file.fieldname === `categoryLogo_${cat.category}`
        );
        
        let logoUrl = "https://placehold.co/600x400.png"; // Default placeholder
        
        if (logoFile) {
          if (useS3) {
            // S3 file location
            logoUrl = logoFile.location;
          } else {
            // Local file path - you may want to serve these statically
            logoUrl = `/uploads/brands/${logoFile.filename}`;
          }
        }
        
        return {
          category: cat.category,
          logo: logoUrl,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
        };
      });

      const newBrand = new Brand({
        name: name.trim(),
        nameTH: nameTH.trim(),
        isActive,
        slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
        categories: categoriesWithLogos,
      });

      await newBrand.save();

      res.status(201).json({
        success: true,
        data: newBrand,
        message: "Brand created successfully",
      });
    } catch (error) {
      console.error("Brand creation error:", error);
      res.status(500).json({
        success: false,
        message: "Brand creation error",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async updateBrand(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Brand ID is required",
        });
      }

      // Check if brand exists
      const existingBrand = await Brand.findById(id);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      console.log("Request body:", req.body);
      console.log("Request files:", req.files);

      const { name, nameTH, isActive, categories } = req.body;
      
      // Validate required fields
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Brand name is required and cannot be empty",
        });
      }

      let parsedCategories = [];
      if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid categories format",
          });
        }
      } else if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else {
        return res.status(400).json({
          success: false,
          message: "Categories array is required",
        });
      }

      // Handle categories with logos (new uploads or existing)
      const categoriesWithLogos = await Promise.all(parsedCategories.map(async cat => {
        // Check if there's a new file uploaded for this category
        const uploadedFile = req.files && req.files.find(file => 
          file.fieldname === `categoryLogo_${cat.category}`
        );

        let logoUrl;
        if (uploadedFile) {
          // New file uploaded - delete old one if it exists and use the new file URL
          const existingCategory = existingBrand.categories.find(existingCat => 
            existingCat.category.toString() === cat.category
          );
          
          // Delete old S3 image if it exists and a new one is uploaded
          if (existingCategory && existingCategory.logo && existingCategory.logo.includes('amazonaws.com')) {
            const oldS3Key = extractS3KeyFromUrl(existingCategory.logo);
            if (oldS3Key) {
              await deleteS3Object(oldS3Key).catch(err => 
                console.log('Failed to delete old S3 object:', err)
              );
            }
          }
          
          if (useS3) {
            logoUrl = uploadedFile.location; // S3 URL
          } else {
            logoUrl = `/uploads/brands/${uploadedFile.filename}`; // Local file path
          }
        } else {
          // No new file - keep existing logo or use provided logo URL
          const existingCategory = existingBrand.categories.find(existingCat => 
            existingCat.category.toString() === cat.category
          );
          logoUrl = cat.logo || (existingCategory ? existingCategory.logo : "https://placehold.co/600x400.png");
        }

        return {
          category: cat.category,
          logo: logoUrl,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
        };
      }));

      const updateData = {
        name: name.trim(),
        nameTH: nameTH ? nameTH.trim() : '',
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
        slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
        categories: categoriesWithLogos,
      };

      const updatedBrand = await Brand.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate('categories.category', 'title');

      res.status(200).json({
        success: true,
        data: updatedBrand,
        message: "Brand updated successfully",
      });
    } catch (error) {
      console.error("Brand update error:", error);
      res.status(500).json({
        success: false,
        message: "Brand update failed",
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

      // Check if brand exists before deletion
      const existingBrand = await Brand.findById(id);
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      // If using S3, delete associated images
      if (useS3 && existingBrand.categories && existingBrand.categories.length > 0) {
        const deletePromises = existingBrand.categories.map(async (categoryItem) => {
          if (categoryItem.logo && categoryItem.logo.includes('amazonaws.com')) {
            const s3Key = extractS3KeyFromUrl(categoryItem.logo);
            if (s3Key) {
              await deleteS3Object(s3Key);
            }
          }
        });
        
        // Wait for all S3 deletions to complete (but don't fail if some fail)
        await Promise.allSettled(deletePromises);
      }

      // Delete the brand from database
      const deletedBrand = await Brand.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        data: deletedBrand,
        message: "Brand and associated images deleted successfully",
      });
    } catch (error) {
      console.error("Brand deletion error:", error);
      res.status(500).json({
        success: false,
        message: "Brand deletion failed",
        error: error.message,
      });
    }
  }
}

module.exports = { BrandsController, upload };
