import express from "express";
import {
    createOffer,
    getMyOffers,
    getOffersByListing,
    getOfferById,
    updateOfferStatus,
    deleteOffer,
} from "../controllers/offer.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyOffers);
router.get("/my", protect, getMyOffers);
router.post("/", protect, createOffer);

router.get("/listing/:listingId", protect, getOffersByListing);
router.get("/:id", protect, getOfferById);

router.patch("/:id", protect, updateOfferStatus);
router.patch("/:id/status", protect, updateOfferStatus);

router.delete("/:id", protect, deleteOffer);

export default router;