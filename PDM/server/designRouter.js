const router = require("express").Router();
const pool = require("./db");
const multer = require("multer");
const jwt = require("jsonwebtoken");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || "D3CE626C-C945-418E-A407-0CEDE5E4CB5B";

// MIDDLEWARE TO PROTECT ROUTES
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access Denied" });

    try {
        const verified = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = verified;  // Assign the verified user to req.user
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};

/* Create Design */
router.post(
    "/designs",
    authenticateToken,
    upload.fields([
        { name: "design_image", maxCount: 1 },
        { name: "cad_file", maxCount: 1 },
        { name: "model_sheet", maxCount: 1 },
        { name: "other_files", maxCount: 5 }
    ]),
    async (req, res) => {
        if (req.user.role.toLowerCase() === "salesperson" || req.user.role.toLowerCase() === "customer") {
            return res.status(403).json({ error: "Access denied" });
        }

        try {
            const {
                design_number,
                price,
                description,
                design_dimensions,
                text_notes,
                gems,
                metals,
                product_type,
                subProductType,
                design_type,
                subDesignType,
                collection,
                subCollection,
                customers,
                subCustomers
            } = req.body;

            const design_image = req.files["design_image"] ? req.files["design_image"][0].buffer : null;
            const cad_file = req.files["cad_file"] ? req.files["cad_file"][0].buffer : null;
            const model_sheet = req.files["model_sheet"] ? req.files["model_sheet"][0].buffer : null;
            const other_files = req.files["other_files"] ? req.files["other_files"].map(f => f.originalname) : [];

            // Insert into designs table
            const newDesign = await pool.query(
                `INSERT INTO designs (design_number, design_image, price, description, design_dimensions, text_notes, author, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
                [design_number, design_image, price, description, design_dimensions, text_notes, req.user.userid]
            );


            // Store categories in an array
            const categoryEntries = [
                { id: product_type, type: 'Product Type' },
                { id: subProductType, type: 'Product Type' },
                { id: collection, type: 'Collection' },
                { id: subCollection, type: 'Collection' },
                { id: design_type, type: 'Design Type' },
                { id: subDesignType, type: 'Design Type' },
                { id: customers, type: 'Customer' },
                { id: subCustomers, type: 'Customer' }
            ];

            // Insert valid categories into design_categories
            for (const entry of categoryEntries) {
                if (entry.id) {
                    await pool.query(
                        `INSERT INTO design_categories (design_id, category_id)
                         VALUES ($1, $2)`,
                        [design_number, entry.id]
                    );
                }
            }

            // Insert gems
            if (gems) {
                const gemsArray = typeof gems === "string" ? JSON.parse(gems) : gems;
                for (const gem of gemsArray) {
                    await pool.query(
                        `INSERT INTO gems_of_design (design_number, gem, shape, size, count, carat_per_gem, dimensions, setting) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            design_number,
                            gem.gem,
                            gem.shape,
                            gem.size,
                            gem.count,
                            gem.carat_per_gem,
                            gem.dimensions,
                            gem.setting
                        ]
                    );
                }
            }

            // Insert metals
            if (metals) {
                const metalsArray = typeof metals === "string" ? JSON.parse(metals) : metals;
                for (const metal of metalsArray) {
                    await pool.query(
                        `INSERT INTO metal_details (design_number, metal_name, weight) VALUES ($1, $2, $3)`,
                        [design_number, metal.metal_name, metal.metal_weight]
                    );
                }
            }

            // Insert files
            await pool.query(
                `INSERT INTO design_files (design_number, cad_file, model_sheet, other_files) 
                 VALUES ($1, $2, $3, $4)`,
                [design_number, cad_file, model_sheet, other_files.length > 0 ? other_files : null]
            );

            res.json({ message: "Design created successfully!" });
        } catch (err) {
            console.error("Error inserting design:", err.message);
            res.status(500).json({ error: err.message });
        }
    }
);

/*Read All Designs*/
router.get("/designs", async (req, res) => {
    try {
        const allDesigns = await pool.query("SELECT * FROM designs");

        const designsWithImages = allDesigns.rows.map((design) => ({
            ...design,
            design_image: design.design_image
                ? `data:image/png;base64,${design.design_image.toString("base64")}`
                : null,
        }));

        res.json(designsWithImages);
    } catch (err) {
        console.error("Error fetching designs:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/*Read a Specific Design with Related Data*/
router.get("/designs/:design_number", async (req, res) => {
    try {
        const { design_number } = req.params;
        const designResult = await pool.query("SELECT * FROM designs WHERE design_number = $1", [design_number]);

        if (designResult.rows.length === 0) {
            return res.status(404).json({ error: "Design not found" });
        }

        const design = designResult.rows[0]; // Correctly access the design data
        const gems = await pool.query("SELECT * FROM gems_of_design WHERE design_number = $1", [design_number]);
        const metals = await pool.query("SELECT * FROM metal_details WHERE design_number = $1", [design_number]);
        const files = await pool.query("SELECT * FROM design_files WHERE design_number = $1", [design_number]);

        res.json({
            ...design,
            gems: gems.rows,
            metals: metals.rows,
            files: files.rows,
            design_image: design.design_image
                ? `data:image/png;base64,${Buffer.from(design.design_image).toString("base64")}`
                : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* Edit Design (Update)  */
router.put("/designs/:design_number", authenticateToken,
    upload.fields([
        { name: "design_image", maxCount: 1 },
        { name: "cad_file", maxCount: 1 },
        { name: "model_sheet", maxCount: 1 },
        { name: "other_files", maxCount: 5 }
    ]),
    async (req, res) => {
        try {
            if (req.user.role.toLowerCase() === "salesperson" || req.user.role.toLowerCase() === "customer") {
                return res.status(403).json({ error: "Access denied" });
            }
            const { design_number } = req.params;
            const {product_type, price, description, design_dimensions, text_notes, gems, metals } = req.body;
            const design_image = req.files["design_image"] ? req.files["design_image"][0].buffer : null;
            const cad_file = req.files["cad_file"] ? req.files["cad_file"][0].buffer : null;
            const model_sheet = req.files["model_sheet"] ? req.files["model_sheet"][0].buffer : null;
            const other_files = req.files["other_files"] ? req.files["other_files"].map(f => f.originalname) : [];

            console.log("Updating design:", design_number);
            
            const designExists = await pool.query("SELECT 1 FROM designs WHERE design_number = $1", [design_number]);
            if (designExists.rowCount === 0) {
                return res.status(404).json({ error: "Design not found" });
            }
            
            await pool.query(
                `UPDATE designs 
                 SET product_type = $1, price = $2, description = $3, design_dimensions = $4, 
                     design_image = COALESCE($5, design_image),modified_by = $7, last_modified_at = NOW(), text_notes = $8
                 WHERE design_number = $6`,
                [product_type, price, description, design_dimensions, design_image, design_number, req.user.username, text_notes]
            );

            //Update gems
            if (gems) {
                const gemsArray = typeof gems === "string" ? JSON.parse(gems) : gems;
                for (const gem of gemsArray) {
                    await pool.query(
                        `INSERT INTO gems_of_design (design_number, gem, shape, size, count, carat_per_gem, dimensions, setting)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                         ON CONFLICT (design_number, gem) 
                         DO UPDATE SET shape = $3, size = $4, count = $5, carat_per_gem = $6, dimensions = $7, setting = $8;`,
                        [
                            design_number,
                            gem.gem,
                            gem.shape,
                            gem.size,
                            gem.count,
                            gem.carat_per_gem,
                            gem.dimensions,
                            gem.setting
                        ]
                    );
                }
            }

            //Update metals
            if (metals) {
                const metalsArray = typeof metals === "string" ? JSON.parse(metals) : metals;
                for (const metal of metalsArray) {
                    await pool.query(
                        `INSERT INTO metal_details (design_number, metal_name, weight)
                         VALUES ($1, $2, $3)
                         ON CONFLICT (design_number, metal_name) 
                         DO UPDATE SET weight = $3;`,
                        [design_number, metal.metal_name, metal.metal_weight]
                    );
                }
            }

            // Update files
            await pool.query(
                `UPDATE design_files 
                 SET cad_file = COALESCE($1, cad_file), 
                     model_sheet = COALESCE($2, model_sheet), 
                     other_files = COALESCE($3, other_files) 
                 WHERE design_number = $4`,
                [cad_file, model_sheet, other_files.length > 0 ? other_files : null, design_number]
            );

            res.json({ message: "Design updated successfully!" });
        } catch (err) {
            console.error("Server error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);
/*Delete Design */
router.delete("/designs/:design_number", async (req, res) => {
    try {
        const { design_number } = req.params;
        await pool.query("DELETE FROM designs WHERE design_number = $1", [design_number]);
        res.json({ message: "Design deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


//categories
router.get("/categories", async (req, res) => {
    try {
        const categories = await pool.query("SELECT * FROM categories");
        res.json(categories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//metals
router.get("/metals", async (req, res) => {
    try {
        const metals = await pool.query("SELECT * FROM metals");
        res.json(metals.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//gemstones
router.get("/gemstones", async (req, res) => {
    try {
        const gemstones = await pool.query("SELECT * FROM gemstones");
        res.json(gemstones.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
