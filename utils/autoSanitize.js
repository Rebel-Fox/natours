const sanitizeHtml = require('sanitize-html');

const autoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeHtml(obj[key], {
            allowedTags: [],
            allowedAttributes: {}
          });
        }
      });
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

module.exports = autoSanitize;