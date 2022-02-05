const router = require("express").Router();
const rfr = require("rfr");

const auth = rfr("middlewares/auth");
const collectionController = rfr("/controllers/collection.controller");
const { errorCatcher } = rfr("/shared/errors");

router
  .route("/collection")
  .post(auth, errorCatcher(collectionController.createCollection))
  .get(auth, errorCatcher(collectionController.getCollections));

router
  .route("/collection/:id")
  .get(auth, errorCatcher(collectionController.getCollection))
  .put(auth, errorCatcher(collectionController.updateCollection))
  .delete(auth, errorCatcher(collectionController.deleteCollection));

module.exports = router;
