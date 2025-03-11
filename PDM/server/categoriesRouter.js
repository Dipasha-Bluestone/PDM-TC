const router = require("express").Router();
const pool = require("./db");
const jwt = require("jsonwebtoken"); 

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

// Middleware to check if the user is an Admin or Manager
const authorizeAdminOrManager = (req, res, next) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "admin" || userRole === "manager") {
        next();
    } else {
        return res.status(403).json({ error: "Access denied. Only admins or managers can perform this action." });
    }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user) { 
        return res.status(401).json({ error: "Unauthorized. No user data." });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden. Admins only." });
    }

    next();
};

/**
 * GET all categories with subcategories, ordered by position
 */
router.get("/categories", authenticateToken, async (req, res) => {
    try {
        const categories = await pool.query(
            `SELECT c1.id, c1.name, c1.type, c1.parent_id, c1.position,
                    COALESCE(json_agg(json_build_object('id', c2.id, 'name', c2.name, 'position', c2.position)) 
                        FILTER (WHERE c2.id IS NOT NULL), '[]'::json) AS subcategories
             FROM categories c1
             LEFT JOIN categories c2 ON c1.id = c2.parent_id
             GROUP BY c1.id, c1.name, c1.type, c1.parent_id, c1.position
             ORDER BY c1.position`
        );
        res.json(categories.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET all distinct category types
 */
router.get("/types", async (req, res) => {
    try {
        const result = await pool.query("SELECT DISTINCT type FROM categories");
        res.json(result.rows.map(row => row.type)); // Return as array of strings
    } catch (error) {
        console.error("Error fetching category types:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * ADD a new category type (only admin)
 */
router.post("/types", authenticateToken, isAdmin, async (req, res) => {
    const { type } = req.body;
    try {
        const newType = await pool.query(
            `INSERT INTO categories (name, type, parent_id, position) 
             VALUES ($1, $1, NULL, (SELECT COALESCE(MAX(position), 0) + 1 FROM categories WHERE parent_id IS NULL)) 
             RETURNING *`,
            [type]
        );
        res.json(newType.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * ADD a new category or subcategory
 */
router.post("/categories", authenticateToken, isAdmin, async (req, res) => {
    const { name, type, parent_id } = req.body;

    try {
        let mainCategoryId = parent_id;

        // If no parent_id, check if the main category exists
        if (!parent_id) {
            const mainCategoryCheck = await pool.query(
                "SELECT id FROM categories WHERE name = $1 AND type = $2 AND parent_id IS NULL",
                [name, type]
            );

            if (mainCategoryCheck.rows.length > 0) {
                mainCategoryId = mainCategoryCheck.rows[0].id; // Use existing main category
            } else {
                // Insert new main category if it doesn't exist
                const newMainCategory = await pool.query(
                    `INSERT INTO categories (name, type, parent_id, position) 
                     VALUES ($1, $2, NULL, 
                         COALESCE((SELECT MAX(position) + 1 FROM categories WHERE parent_id IS NULL), 1)
                     ) RETURNING id`,
                    [name, type]
                );
                mainCategoryId = newMainCategory.rows[0].id;
            }
        }

        // If parent_id exists, this means we're adding a subcategory
        if (parent_id) {
            const newSubcategory = await pool.query(
                `INSERT INTO categories (name, type, parent_id, position) 
                 VALUES ($1, $2, $3, 
                     COALESCE((SELECT MAX(position) + 1 FROM categories WHERE parent_id = $3), 1)
                 ) RETURNING *`,
                [name, type, parent_id]
            );
            return res.json(newSubcategory.rows[0]);
        }

        res.json({ id: mainCategoryId, name, type, parent_id: null });

    } catch (err) {
        console.error("Error inserting category:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * UPDATE category name
 */
router.put("/categories/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const updatedCategory = await pool.query(
            `UPDATE categories SET name = $1 WHERE id = $2 RETURNING *`,
            [name, id]
        );
        res.json(updatedCategory.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE category and its subcategories
 */
router.delete("/categories/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM categories WHERE parent_id = $1", [id]); // Delete subcategories first
        await pool.query("DELETE FROM categories WHERE id = $1", [id]); // Delete the main category
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE type
 */
router.delete("/types/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM categories WHERE id = $1", [id]); // Delete the main category
        res.json({ message: "Category Type deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * UPDATE category type name
 */
router.put("/types/:oldType", authenticateToken, isAdmin, async (req, res) => {
    const { oldType } = req.params;
    const { newType } = req.body;

    try {
        const updatedType = await pool.query(
            `UPDATE categories SET type = $1 WHERE type = $2 RETURNING *`,
            [newType, oldType]
        );

        if (updatedType.rowCount === 0) {
            return res.status(404).json({ error: "Type not found" });
        }

        res.json({ message: "Type updated successfully", updatedType: updatedType.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * UPDATE category order (drag-and-drop functionality)
 */
router.put("/categories/order", authenticateToken, isAdmin, async (req, res) => {
    const { orderedCategories } = req.body; // Array of { id, new_position }
    try {
        for (const { id, new_position } of orderedCategories) {
            await pool.query(
                "UPDATE categories SET position = $1 WHERE id = $2",
                [new_position, id]
            );
        }
        res.json({ message: "Category order updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//parent cat
router.get("/parents/:type", authenticateToken,isAdmin, async (req, res) => {
    const { type } = req.params;
    try {
        const parents = await pool.query(
            "SELECT * FROM categories WHERE type = $1 AND parent_id IS NULL", [type]
        );
        res.json(parents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});


// Edit a Product Type [ADMIN & MANAGER ONLY]
router.put("/category/:id", authenticateToken, authorizeAdminOrManager, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parent_id } = req.body;
        const updatedCategory = await pool.query(
            "UPDATE categories SET name = $1, parent_id = $2 WHERE id = $3 RETURNING *",
            [name, parent_id || null, id]
        );
        if (updatedCategory.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(updatedCategory.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete a Product Type or Subcategory [ADMIN & MANAGER ONLY]
router.delete("/category/:id", authenticateToken, authorizeAdminOrManager, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const categoryCheck = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Delete the category (cascading to subcategories if any)
        await pool.query("DELETE FROM categories WHERE id = $1 OR parent_id = $1", [id]);

        res.json({ message: "Category and any subcategories deleted successfully." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
