import React, { useEffect, useState } from "react";

const DisplayImage = ({ design_number }) => {
    const [design, setDesign] = useState(null);

    useEffect(() => {
        const fetchDesign = async () => {
            try {
                const response = await fetch(`http://localhost:5000/designs/${design_number}`);
                const data = await response.json();
                setDesign(data);
            } catch (err) {
                console.error("Error fetching design:", err);
            }
        };

        fetchDesign();
    }, [design_number]);

    return (
        <div>
            {design ? (
                <div>
                    {design.design_image ? (
                        <img
                            src={design.design_image}
                            alt="Design"
                            style={{ width: "200px", height: "200px", objectFit: "cover" }}
                        />
                    ) : (
                        <p>No image available</p>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default DisplayImage;
