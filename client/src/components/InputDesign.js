import React, { useState } from "react";

const InputDesign = () => {
    const [design_number, setDesignNumber] = useState("");
    const [design_image, setDesignImage] = useState(null);
    const [category, setCategory] = useState("");
    const [product_type, setProductType] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [design_dimensions, setDesignDimensions] = useState("");

    // Metal Details
    const [metals, setMetals] = useState([]);
    const addMetal = () => {
        setMetals([...metals, { metal_name: "", metal_weight: "" }]);
    };
    const updateMetal = (index, field, value) => {
        const updatedMetals = [...metals];
        updatedMetals[index][field] = value;
        setMetals(updatedMetals);
    };
    const removeMetal = (index) => {
        setMetals(metals.filter((_, i) => i !== index));
    };

    // Gem Details
    const [gems, setGems] = useState([]);
    const addGem = () => {
        setGems([...gems, { gem: "", shape: "", size: "", count: "", carat_per_gem: "", dimensions: "", setting: "" }]);
    };
    const updateGem = (index, field, value) => {
        const updatedGems = [...gems];
        updatedGems[index][field] = value;
        setGems(updatedGems);
    };
    const removeGem = (index) => {
        setGems(gems.filter((_, i) => i !== index));
    };

    // File Uploads
    const [cad_file, setCadFile] = useState(null);
    const [model_sheet, setModelSheet] = useState(null);
    const [other_files, setOtherFiles] = useState([]);


  


    const onSubmitForm = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("design_number", design_number);
        formData.append("design_image", design_image);
        formData.append("category", category);
        formData.append("product_type", product_type);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("design_dimensions", design_dimensions);

        // Append metals as JSON
        formData.append("metals", JSON.stringify(metals));

        // Append gems as JSON
        formData.append("gems", JSON.stringify(gems));

        // File Uploads
        if (cad_file) formData.append("cad_file", cad_file);
        if (model_sheet) formData.append("model_sheet", model_sheet);
        if (other_files.length > 0) {
            other_files.forEach((file) => formData.append("other_files", file));
        }
        // Debugging Output
        //for (let pair of formData.entries()) {
        //    console.log(pair[0], pair[1]);
        //}

        try {
            const response = await fetch("http://localhost:5000/designs", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Design uploaded successfully!");
                window.location.reload();
            } else {
                alert("Error uploading design");
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div>
            <form className="d-flex flex-column mt-5" onSubmit={onSubmitForm} encType="multipart/form-data">
                {/* Design Info */}
                <input type="text" className="form-control" placeholder="Design Number" value={design_number} onChange={(e) => setDesignNumber(e.target.value)} required />
                <input type="file" className="form-control" accept="image/*" onChange={(e) => setDesignImage(e.target.files[0])} required />
                <input type="text" className="form-control" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                <input type="text" className="form-control" placeholder="Product Type" value={product_type} onChange={(e) => setProductType(e.target.value)} required />
                <input type="number" step="0.01" className="form-control" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <textarea className="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="text" className="form-control" placeholder="Design Dimensions" value={design_dimensions} onChange={(e) => setDesignDimensions(e.target.value)} required />

                {/* Metal Details */}
                <h3 className="mt-4">Metal Details</h3>
                {metals.map((metal, index) => (
                    <div key={index}>
                        <input type="text" className="form-control" placeholder="Metal Name" value={metal.metal_name} onChange={(e) => updateMetal(index, "metal_name", e.target.value)} required />
                        <input type="number" step="0.01" className="form-control" placeholder="Metal Weight" value={metal.metal_weight} onChange={(e) => updateMetal(index, "metal_weight", e.target.value)} required />
                        <button type="button" onClick={() => removeMetal(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addMetal}>Add Metal</button>

                {/* Gem Details */}
                <h3 className="mt-4">Gem Details</h3>
                {gems.map((gem, index) => (
                    <div key={index}>
                        <input type="text" className="form-control" placeholder="Gem Type" value={gem.gem} onChange={(e) => updateGem(index, "gem", e.target.value)} required />
                        <input type="text" className="form-control" placeholder="Shape" value={gem.shape} onChange={(e) => updateGem(index, "shape", e.target.value)} required />
                        <input type="text" className="form-control" placeholder="Size" value={gem.size} onChange={(e) => updateGem(index, "size", e.target.value)} required />
                        <input type="number" className="form-control" placeholder="Count" value={gem.count} onChange={(e) => updateGem(index, "count", e.target.value)} required />
                        <input type="number" step="0.01" className="form-control" placeholder="Carat Per Gem" value={gem.carat_per_gem} onChange={(e) => updateGem(index, "carat_per_gem", e.target.value)} required />
                        <input type="text" className="form-control" placeholder="Dimensions" value={gem.dimensions} onChange={(e) => updateGem(index, "dimensions", e.target.value)} required />
                        <input type="text" className="form-control" placeholder="Setting" value={gem.setting} onChange={(e) => updateGem(index, "setting", e.target.value)} required />
                        <button type="button" onClick={() => removeGem(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addGem}>Add Gem</button>
                {/* File Uploads */}
                <h3 className="mt-4">Upload Files</h3>
                <label>CAD File:</label>
                <input type="file" className="form-control" accept=".cad,.stp,.step,.3dm,.stl" onChange={(e) => setCadFile(e.target.files[0])} />

                <label>Model Sheet:</label>
                <input type="file" className="form-control" accept=".pdf,.jpg,.png" onChange={(e) => setModelSheet(e.target.files[0])} />

                <label>Other Files:</label>
                <input type="file" className="form-control" multiple onChange={(e) => setOtherFiles([...e.target.files])} />


                <button className="btn btn-success mt-3">Add Design</button>
            </form>
        </div>
    );
};

export default InputDesign;
