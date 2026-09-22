import {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
} from "../services/listing.service.js";

export const create = async (req, res) => {
    try {
        const imageUrls = req.files.map((file) => file.path);

        const listing = await createListing(req.user.userId, {
            ...req.body,
            images: imageUrls,
        });

        res.status(201).json({
            success: true,
            listing,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const listings = await getListings(req.query);

        res.status(200).json({
            success: true,
            listings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOne = async (req, res) => {
    try {
        const listing = await getListingById(req.params.id);

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

export const update = async (req, res) => {
    try {
        const listing = await updateListing(
            req.params.id,
            req.user.userId,
            req.body
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