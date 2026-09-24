import Offer from "../models/offer.model.js";

export const createOffer = async (data) => {
    return await Offer.create(data);
};

export const getOffersByListing = async (listingId) => {
    return await Offer.find({ listingId }).sort({ createdAt: -1 });
};

export const getOffersByUser = async (userId, role) => {
    const filter = {};
    if (role === "seller") {
        filter.sellerId = userId;
    } else if (role === "buyer") {
        filter.buyerId = userId;
    } else {
        filter.$or = [{ sellerId: userId }, { buyerId: userId }];
    }
    return await Offer.find(filter).sort({ createdAt: -1 });
};

export const getOfferById = async (id) => {
    return await Offer.findById(id);
};

export const updateOfferStatus = async (id, status) => {
    const normalizedStatus = status.toLowerCase();
    return await Offer.findByIdAndUpdate(
        id,
        { status: normalizedStatus },
        { new: true, runValidators: true }
    );
};

export const deleteOffer = async (id) => {
    return await Offer.findByIdAndDelete(id);
};