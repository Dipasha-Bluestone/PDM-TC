const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const pool = require("./db"); // PostgreSQL connection
require("dotenv").config();

// Configure Multer for profile picture uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || "D3CE626C-C945-418E-A407-0CEDE5E4CB5B";

// REGISTER USER
router.post("/register", upload.single("profile_pic"), async (req, res) => {
    try {
        const { username, email, password, roleid } = req.body;
        const profile_pic = req.file ? req.file.buffer : null;

        // Check if user already exists
        const userExists = await pool.query("SELECT * FROM pdm_user WHERE Email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const newUser = await pool.query(
            "INSERT INTO pdm_user (Username, Email, Password, RoleID, Profile_pic) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, email, hashedPassword, roleid, profile_pic]
        );

        res.json({ message: "User registered successfully!", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN USER
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch user with RoleName
        const user = await pool.query(
            `SELECT u.*, r.RoleName,
            COALESCE(d.author, 1) AS author
            FROM pdm_user u
            JOIN role r ON u.RoleID = r.RoleID
            LEFT JOIN designs d ON d.author = u.userid
            WHERE u.Email = $1;`, [email]);
                                                  
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare passwords
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        let userData = user.rows[0];

        // Convert profile_pic from Buffer to Base64 (if it exists)
        if (userData.profile_pic && Buffer.isBuffer(userData.profile_pic)) {
            userData.profile_pic = `data:image/jpeg;base64,${userData.profile_pic.toString("base64")}`;
        } else {
            userData.profile_pic = null; // Ensure no [object Object] issues
        }

        // Generate JWT token with RoleName
        const token = jwt.sign(
            { userid: userData.userid, role: userData.rolename },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful!", token, user: userData });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

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

// GET AUTHENTICATED USER PROFILE
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT userid, username, email, profile_pic, roleid FROM pdm_user WHERE userid = $1",
            [req.user.userid]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        let userData = user.rows[0];

        res.json(userData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET ALL USERS (ADMIN ONLY)
router.get("/users", authenticateToken, async (req, res) => {
    // console.log("Authenticated User Role:", req.user.role); // Debugging

    if (req.user.role.toLowerCase() !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }

    try {
        const users = await pool.query(
            `SELECT u.UserID, u.Username, u.Email, u.profile_pic, r.RoleName 
             FROM pdm_user u
             JOIN role r ON u.RoleID = r.RoleID`
        );
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});



// DELETE USER (ADMIN ONLY)
router.delete("/users/:id", authenticateToken, async (req, res) => {
    if (req.user.role.toLowerCase() !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;

    try {
        await pool.query("DELETE FROM pdm_user WHERE userid = $1", [id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//EDIT USERS
router.put(
    "/users/:id",
    authenticateToken,
    upload.single("profile_pic"),
    async (req, res) => {
        if (req.user.role.toLowerCase() !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const { username, email, roleid } = req.body;
        const { id } = req.params;
        const profile_pic = req.file["profile_pic"] ? req.file["profile_pic"][0].buffer : null;

        try {
            const query = `
                UPDATE pdm_user 
                SET username = $1, email = $2, roleid = $3, profile_pic = COALESCE($4, profile_pic) 
                WHERE userid = $5
            `;

            const values = [username, email, roleid, profile_pic, id];

            const result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ message: "User updated successfully" });
        } catch (err) {
            console.error("Database Error:", err.message);
            res.status(500).json({ error: "Server error" });
        }
    }
);


//roles
router.get("/roles", async (req, res) => {
    try {
        const roles = await pool.query("SELECT * FROM role");
        res.json(roles.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
