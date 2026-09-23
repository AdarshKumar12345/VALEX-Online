import Listing from "../models/listing.model.js";

export const createListing = async (userId, data) => {
    return await Listing.create({
        ...data,
        sellerId: userId,
    });
};

export const getListings = async (query = {}) => {
    const {
        q,
        category,
        condition,
        location,
        minPrice,
        maxPrice,
        sellerId,
        status = "active",
        sort = "latest",
        page = 1,
        limit = 12,
    } = query;

    const filter = {};

    if (status && status !== "all") {
        filter.status = status;
    }

    if (sellerId) {
        filter.sellerId = sellerId;
    }

    if (category) {
        filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (condition) {
        const condRegex = condition.replace(/-/g, " ");
        filter.condition = {
            $regex: new RegExp(`^(${condition}|${condRegex})$`, "i"),
        };
    }

    if (location) {
        filter.$or = [
            { "location.city": { $regex: location, $options: "i" } },
            { "location.state": { $regex: location, $options: "i" } },
            { location: { $regex: location, $options: "i" } },
        ];
    }

    if (q) {
        const searchRegex = { $regex: q, $options: "i" };
        const searchConditions = [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
        ];

        if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
            delete filter.$or;
        } else {
            filter.$or = searchConditions;
        }
    }

    if (
        (minPrice !== undefined && minPrice !== "") ||
        (maxPrice !== undefined && maxPrice !== "")
    ) {
        filter.price = {};
        if (minPrice !== undefined && minPrice !== "") {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined && maxPrice !== "") {
            filter.price.$lte = Number(maxPrice);
        }
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === "price-low" || sort === "price_asc") {
        sortOption = { price: 1 };
    } else if (sort === "price-high" || sort === "price_desc") {
        sortOption = { price: -1 };
    } else if (sort === "oldest") {
        sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

    return {
        listings,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
    };
};

export const getListingById = async (id) => {
    return await Listing.findById(id);
};

export const updateListing = async (id, userId, data) => {
    return await Listing.findOneAndUpdate(
        { _id: id, sellerId: userId },
        data,
        { new: true, runValidators: false }
    );
};

export const deleteListing = async (id, userId) => {
    return await Listing.findOneAndDelete({
        _id: id,
        sellerId: userId,
    });
};