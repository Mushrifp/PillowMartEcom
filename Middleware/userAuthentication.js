const isLogin = async (req, res, next) => {
  try {
    console.log("reached the login ");
    console.log("From login this is the session", req.session);
    if (req.session.user_id) {
      next();
      console.log("continue with next");
    } else {
      console.log("no session");
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    console.log("From logout this is the session", req.session);
    console.log("reached the logout ");
    if (req.session.user_id) {
      res.redirect("/");
      console.log("have session");
    } else {
      console.log("continue with next");
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
