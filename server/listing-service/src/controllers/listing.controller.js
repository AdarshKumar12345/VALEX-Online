import {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
} from "../services/listing.service.js";

export const create = async (req, res) => {
    try {
        const files = req.files || [];
        const imageUrls = files.map((file) => {
            return `http://localhost:8000/listings/uploads/${file.filename}`;
        });

        const existingImages = req.body.images
            ? Array.isArray(req.body.images)
                ? req.body.images
                : [req.body.images]
            : [];

        const allImages = [...imageUrls, ...existingImages];

        const listingData = {
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            condition: req.body.condition || "good",
            location: req.body.location || "Location not specified",
            images: allImages,
        };

        const listing = await createListing(req.user.userId, listingData);

        res.status(201).json({
            success: true,
            listing,
        });
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyListings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await getListings({
            sellerId: userId,
            status: "all",
            limit: 100,
        });

        const formattedListings = result.listings.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            price: item.price,
            category: item.category,
            condition: item.condition,
            location:
                typeof item.location === "object"
                    ? `${item.location.city || ""}, ${item.location.state || ""}`.replace(/^, |, $/g, "")
                    : item.location || "Location not specified",
            status: item.status || "active",
            imageUrl: item.images?.[0] || "",
            images: item.images || [],
            views: item.views || 0,
            favorites: item.favorites || 0,
            createdAt: item.createdAt,
        }));

        res.status(200).json({
            success: true,
            listings: formattedListings,
            total: result.total,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const result = await getListings(req.query);

        res.status(200).json({
            success: true,
            listings: result.listings,
            total: result.total,
            page: result.page,
            pages: result.pages,
        });
    } catch (error) {
        console.error("Error in getAll listings:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || id === "me") {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        const listing = await getListingById(id);

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        res.status(200).json({
            success: true,
            listing,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const files = req.files || [];
        const newImageUrls = files.map((file) => {
            return `http://localhost:8000/listings/uploads/${file.filename}`;
        });

        const existingImages = req.body.images
            ? Array.isArray(req.body.images)
                ? req.body.images
                : [req.body.images]
            : [];

        const updateData = { ...req.body };
        if (newImageUrls.length > 0 || existingImages.length > 0) {
            updateData.images = [...newImageUrls, ...existingImages];
        }
        if (req.body.price) {
            updateData.price = Number(req.body.price);
        }

        const listing = await updateListing(
            req.params.id,
            req.user.userId,
            updateData
        );

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        res.status(200).json({
            success: true,
            listing,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const listing = await deleteListing(
            req.params.id,
            req.user.userId
        );

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        res.status(200).json({
            success: true,
            message: "Listing deleted",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};