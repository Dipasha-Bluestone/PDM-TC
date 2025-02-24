const router = require("express").Router();
const pool = require("./db");
const multer = require("multer");

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

// Create design with gems, metals, and files
router.post("/designs", upload.fields([
    { name: "design_image", maxCount: 1 },
    { name: "cad_file", maxCount: 1 },
    { name: "model_sheet", maxCount: 1 },
    { name: "other_files", maxCount: 5 }
]), async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        console.log("Received Files:", req.files);

        const { design_number, category, product_type, price, description, design_dimensions } = req.body;
        const design_image = req.files["design_image"] ? req.files["design_image"][0].buffer : null;
        const cad_file = req.files["cad_file"] ? req.files["cad_file"][0].buffer : null;
        const model_sheet = req.files["model_sheet"] ? req.files["model_sheet"][0].buffer : null;

        // Convert file buffers to text filenames (or paths, depending on storage)
        const other_files = req.files["other_files"]
            ? req.files["other_files"].map(f => f.originalname) // Store filenames instead of binary
            : [];

        // Insert into `designs` table
        const newDesign = await pool.query(
            `INSERT INTO designs (design_number, design_image, category, product_type, price, description, design_dimensions) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [design_number, design_image, category, product_type, price, description, design_dimensions]
        );

        console.log("Inserted Design:", newDesign.rows[0]);

        // Insert into `gems_of_design` table (only if gems exist)
        if (req.body.gems) {
            console.log("Raw Gems Data:", req.body.gems); // Debugging
            let gemsArray = req.body.gems;

            // If gemsArray is a string (FormData sends strings), parse it
            if (typeof gemsArray === "string") {
                try {
                    gemsArray = JSON.parse(gemsArray);
                    console.log("Parsed Gems Array:", gemsArray);
                } catch (error) {
                    console.error("Error parsing gems JSON:", error);
                    return res.status(400).json({ error: "Invalid gems format" });
                }
            }

            if (!Array.isArray(gemsArray)) {
                console.error("Gems is not an array:", gemsArray);
                return res.status(400).json({ error: "Gems data should be an array" });
            }

            for (const gemt of gemsArray) {
                console.log("Inserting Gem:", gemt);
                const { gem, shape, size, count, carat_per_gem, dimensions, setting } = gemt;

                await pool.query(
                    `INSERT INTO gems_of_design (design_number, gem, shape, size, count, carat_per_gem, dimensions, setting) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        design_number,
                        gem,
                        shape,
                        size,
                        count,
                        carat_per_gem,
                        dimensions,
                        setting
                    ]
                );
            }
            console.log("Inserted Gems Successfully");
        }

        // Insert into `metal_details` table (supports multiple metals)
        if (req.body.metals) {
            console.log("Raw Metals Data:", req.body.metals); // Debugging
            let metalsArray = req.body.metals;

            // If metalsArray is a string (FormData sends strings), parse it
            if (typeof metalsArray === "string") {
                try {
                    metalsArray = JSON.parse(metalsArray);
                    console.log("Parsed Metals Array:", metalsArray);
                } catch (error) {
                    console.error("Error parsing metals JSON:", error);
                    return res.status(400).json({ error: "Invalid metals format" });
                }
            }

            if (!Array.isArray(metalsArray)) {
                console.error("Metals is not an array:", metalsArray);
                return res.status(400).json({ error: "Metals data should be an array" });
            }

            for (const metal of metalsArray) {
                console.log("Inserting Metal:", metal);
                const { metal_name, metal_weight } = metal;

                await pool.query(
                    `INSERT INTO metal_details (design_number, metal_name, weight) VALUES ($1, $2, $3)`,
                    [design_number, metal_name, metal_weight]
                );
            }
            console.log("Inserted Metals Successfully");
        }


        //Insert into `design_files` table
        if (cad_file || model_sheet || other_files.length > 0) {
            await pool.query(
                `INSERT INTO design_files (design_number, cad_file, model_sheet, other_files) 
                 VALUES ($1, $2, $3, $4)`,
                [
                    design_number,
                    cad_file || null,
                    model_sheet || null,
                    other_files.length > 0 ? other_files : null // Store as an array of filenames
                ]
            );
        } else {
            console.log("Skipping file insertion due to missing files.");
        }

        res.json({ message: "Design created successfully!" });
    } catch (err) {
        console.error("Error inserting design:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// Read all designs with related data
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

//delete design
router.delete("/designs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM designs WHERE design_number = $1", [id]);
        res.json({ message: "Design deleted successfully!" });
    } catch (err) {
        console.error("Error deleting design:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});


// Read a single design with its related data
router.get("/designs/:design_number", async (req, res) => {
    try {
        const { design_number } = req.params;
        const result = await pool.query("SELECT * FROM designs WHERE design_number = $1", [design_number]);

        if (result.rows.length > 0) {
            const design = result.rows[0];

            res.json({
                ...design,
                design_image: design.design_image
                    ? `data:image/png;base64,${Buffer.from(design.design_image).toString("base64")}`
                    : null,
            });
        } else {
            res.status(404).json({ error: "Design not found" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});


module.exports = router;
