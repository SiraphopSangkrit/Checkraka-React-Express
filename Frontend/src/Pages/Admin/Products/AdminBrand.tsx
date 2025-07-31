import { useParams } from "react-router";

export default function AdminBrand() {
    const { category } = useParams<{ category: string }>();
  
    return(
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Brand</h1>
            <p>This is the Admin Brand page.</p>
            {category && (
                <p>Category: {category}</p>
            )}
        </div>
    )
}

