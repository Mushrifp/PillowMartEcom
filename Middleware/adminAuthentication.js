const isLogin = async (req, res, next) => {
  try {
    if (req.session.admin_mail) {
      console.log(req.session.admin_mail);
      console.log(req.session);
      next();
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    console.log("admin Logout");
    if (req.session.admin_mail) {
      res.redirect("/admin/home");
    } else {
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
