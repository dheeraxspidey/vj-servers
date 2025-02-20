import { useState } from "react";

function ClaimedItemDetails({ item }) {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="mt-2 p-3 border rounded-md bg-gray-50 text-sm">
            {/* Compact View */}
            <div className="flex justify-between items-center">
                <div>
                    <p><strong>Name:</strong> {item.claimerDetails?.name || "N/A"}</p>
                    <p><strong>Roll No:</strong> {item.claimerDetails?.rollNo || "N/A"}</p>
                    <p><strong>Contact:</strong> {item.claimerDetails?.contact || "N/A"}</p>
                </div>
                <button
                    className="text-blue-500 text-xs underline"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "Hide" : "Details"}
                </button>
            </div>

            {/* Expanded View */}
            {expanded && (
                <div className="mt-2 border-t pt-2 text-xs space-y-1">
                    <p><strong>Handovered On:</strong> {formatDate(item.claimerDetails?.dateHandovered)}</p>
                    <p><strong>Reporter Roll No:</strong> {item.reporterRollNo || "N/A"}</p>

                    {item.image?.url && (
                        <img src={item.image.url} alt="Found Item" className="w-20 h-20 object-cover rounded-md border" />
                    )}

                    {item.claimerDetails?.proofs?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {item.claimerDetails.proofs.map((proof, index) => (
                                <img key={index} src={proof.url} alt={`Proof ${index + 1}`} className="w-20 h-20 object-cover rounded-md border" />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ClaimedItemDetails;
