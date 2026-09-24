import * as offerService from "../services/offer.service.js";

const formatOffer = (offer) => {
    if (!offer) return null;
    const doc = offer.toObject ? offer.toObject() : offer;
    return {
        ...doc,
        id: doc._id ? doc._id.toString() : doc.id,
        listingTitle: doc.listingTitle || "Listing",
        listingPrice: doc.listingPrice || 0,
        buyerName: doc.buyerName || "Buyer",
        status: (doc.status || "pending").toLowerCase(),
    };
};

export const createOffer = async (req, res) => {
    try {
        const buyerId = req.user.id || req.user.userId;
        const { listingId, sellerId, amount, message, listingTitle, listingPrice, buyerName } = req.body;

        if (!listingId || !sellerId || !amount) {
            return res.status(400).json({
                success: false,
                message: "listingId, sellerId, and amount are required",
            });
        }

        if (sellerId === buyerId) {
            return res.status(400).json({
                success: false,
                message: "You cannot make an offer on your own listing",
            });
        }

        const offer = await offerService.createOffer({
            listingId,
            sellerId,
            buyerId,
            amount: Number(amount),
            message: message ? message.trim() : "",
            listingTitle: listingTitle || "Listing",
            listingPrice: listingPrice ? Number(listingPrice) : 0,
            buyerName: buyerName || req.user.name || req.user.email?.split("@")[0] || "Buyer",
            status: "pending",
        });

        const formatted = formatOffer(offer);

        res.status(201).json({
            success: true,
            offer: formatted,
            data: formatted,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyOffers = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const role = req.query.role; // 'seller', 'buyer', or undefined for both
        const offers = await offerService.getOffersByUser(userId, role);
        const formatted = offers.map(formatOffer);

        res.json({
            success: true,
            offers: formatted,
            data: formatted,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getOffersByListing = async (req, res) => {
    try {
        const offers = await offerService.getOffersByListing(
            req.params.listingId
        );
        const formatted = offers.map(formatOffer);

        res.json({
            success: true,
            offers: formatted,
            data: formatted,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getOfferById = async (req, res) => {
    try {
        const offer = await offerService.getOfferById(req.params.id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found",
            });
        }

        const formatted = formatOffer(offer);

        res.json({
            success: true,
            offer: formatted,
            data: formatted,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateOfferStatus = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            });
        }

        const existingOffer = await offerService.getOfferById(req.params.id);
        if (!existingOffer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found",
            });
        }

        const normStatus = status.toLowerCase();

        // Check role authorization
        if (["accepted", "rejected", "countered"].includes(normStatus)) {
            if (existingOffer.sellerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "Only the seller can accept, reject, or counter this offer.",
                });
            }
        } else if (["cancelled", "withdrawn"].includes(normStatus)) {
            if (existingOffer.buyerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "Only the buyer can cancel or withdraw this offer.",
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid offer status",
            });
        }

        const offer = await offerService.updateOfferStatus(
            req.params.id,
            normStatus
        );

        const formatted = formatOffer(offer);

        res.json({
            success: true,
            offer: formatted,
            data: formatted,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteOffer = async (req, res) => {
    try {
        await offerService.deleteOffer(req.params.id);
        res.json({
            success: true,
            message: "Offer deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};