export const checkAuth = (req, res, next) => {
    console.log(req.auth());
    console.log("checking if session exists");
    if (!req.auth().sessionId) {
        return next(new Error("Unauthenticated"));
    }
    next();
};


