import Listing from "../models/listing.model.js";

export const createListing = async (userId, data) => {
    return await Listing.create({
        ...data,
        sellerId: userId,
    });
};

export const getListings = async (filters = {}) => {
    return await Listing.find({
        status: "active",
        ...filters,
    }).sort({ createdAt: -1 });
};

export const getListingById = async (id) => {
    return await Listing.findById(id);
};

export const updateListing = async (id, userId, data) => {
    return await Listing.findOneAndUpdate(
        { _id: id, sellerId: userId },
        data,
        { new: true, runValidators: true }
    );
};

export const deleteListing = async (id, userId) => {
    return await Listing.findOneAndDelete({
        _id: id,
        sellerId: userId,
    });
};