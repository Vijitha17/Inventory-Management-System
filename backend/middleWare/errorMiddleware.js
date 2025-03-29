const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    
    // Customize error response based on environment
    const errorResponse = {
        success: false,
        message: process.env.NODE_ENV === "development" ? err.message : "An error occurred",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    // Handle Sequelize database errors
    if (err.name && err.name.includes('Sequelize')) {
        errorResponse.message = 'Database error occurred';
        
        // Handle unique constraint errors
        if (err.name === 'SequelizeUniqueConstraintError') {
            errorResponse.message = err.errors[0].message || 'Duplicate field value entered';
            res.status(400);
        }
        // Handle validation errors
        else if (err.name === 'SequelizeValidationError') {
            errorResponse.message = err.errors.map(e => e.message).join(', ');
            res.status(400);
        }
        // Handle database connection/timeout errors
        else if (err.name === 'SequelizeConnectionError') {
            errorResponse.message = 'Database connection error';
            res.status(503);
        }
        else {
            res.status(500);
        }
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        errorResponse.message = 'Invalid or expired token';
        res.status(401);
    }
    else {
        res.status(statusCode);
    }

    // Log errors in development
    if (process.env.NODE_ENV === "development") {
        console.error(err);
    }

    // Send JSON response
    res.json(errorResponse);
};

module.exports = errorHandler;

