const successResponse = (
    res,
    data = null,
    message = "Success",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (
    res,
    message = "Something went wrong",
    statusCode = 500
) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

export {
    successResponse,
    errorResponse
};