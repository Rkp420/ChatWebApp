
const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const message = err.message || "Internal Server Error";
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
}

module.exports = globalErrorHandler;
