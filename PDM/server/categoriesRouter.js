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

// Get Parent Categories (parent_id is NULL)
//product type
router.get("/product_types/parents", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const parents = await pool.query(
            "SELECT * FROM categories WHERE type = 'product_type' AND parent_id IS NULL"
        );
        res.json(parents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//collections
router.get("/collections/parents", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const parents = await pool.query(
            "SELECT * FROM categories WHERE type = 'collections' AND parent_id IS NULL"
        );
        res.json(parents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//design types
router.get("/designtypes/parents", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const parents = await pool.query(
            "SELECT * FROM categories WHERE type = 'design_type' AND parent_id IS NULL"
        );
        res.json(parents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//customers
router.get("/customers/parents", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const parents = await pool.query(
            "SELECT * FROM categories WHERE type = 'customers' AND parent_id IS NULL"
        );
        res.json(parents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Get Subcategories for a category
//product type
router.get("/product_types/:parentId", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const { parentId } = req.params;
        const subTypes = await pool.query(
            "SELECT * FROM categories WHERE type = 'product_type' AND parent_id = $1",
            [parentId]
        );
        res.json(subTypes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//collections
router.get("/collections/:parentId", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const { parentId } = req.params;
        const subTypes = await pool.query(
            "SELECT * FROM categories WHERE type = 'collections' AND parent_id = $1",
            [parentId]
        );
        res.json(subTypes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//design types
router.get("/designtypes/:parentId", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const { parentId } = req.params;
        const subTypes = await pool.query(
            "SELECT * FROM categories WHERE type = 'design_type' AND parent_id = $1",
            [parentId]
        );
        res.json(subTypes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//customers
router.get("/customers/:parentId", authenticateToken, async (req, res) => {
    const userRole = req.user.role.toLowerCase();
    if (userRole === "salesperson" || userRole === "customer") {
        return res.status(403).json({ error: "Access denied" });
    }
    try {
        const { parentId } = req.params;
        const subTypes = await pool.query(
            "SELECT * FROM categories WHERE type = 'customers' AND parent_id = $1",
            [parentId]
        );
        res.json(subTypes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Add a New Product Type (Parent or Subcategory) [ADMIN & MANAGER ONLY]
//product type
router.post("/product_types", authenticateToken, authorizeAdminOrManager, async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const newProductType = await pool.query(
            "INSERT INTO categories (name, type, parent_id) VALUES ($1, 'product_type', $2) RETURNING *",
            [name, parent_id || null]
        );
        res.json(newProductType.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//collections
router.post("/collections", authenticateToken, authorizeAdminOrManager, async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const newProductType = await pool.query(
            "INSERT INTO categories (name, type, parent_id) VALUES ($1, 'collections', $2) RETURNING *",
            [name, parent_id || null]
        );
        res.json(newProductType.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//design types
router.post("/designtypes", authenticateToken, authorizeAdminOrManager, async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const newProductType = await pool.query(
            "INSERT INTO categories (name, type, parent_id) VALUES ($1, 'design_type', $2) RETURNING *",
            [name, parent_id || null]
        );
        res.json(newProductType.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});
//customers
router.post("/customers", authenticateToken, authorizeAdminOrManager, async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const newProductType = await pool.query(
            "INSERT INTO categories (name, type, parent_id) VALUES ($1, 'customers', $2) RETURNING *",
            [name, parent_id || null]
        );
        res.json(newProductType.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Edit a Product Type [ADMIN & MANAGER ONLY]
router.put("/categories/:id", authenticateToken, authorizeAdminOrManager, async (req, res) => {
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
router.delete("/categories/:id", authenticateToken, authorizeAdminOrManager, async (req, res) => {
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
