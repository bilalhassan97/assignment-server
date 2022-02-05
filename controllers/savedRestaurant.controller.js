const rfr = require("rfr");
const { isValidObjectId } = require("mongoose");
const mongoose = require("mongoose");

const statusCodes = rfr("/shared/statusCode"),
  { SavedRestaurant, validateSavedRestaurant } = rfr("models"),
  { sendErrorResponse, sendSuccessResponse } = rfr("/shared/messages");
const ObjectId = mongoose.Types.ObjectId;

exports.createSavedRestaurant = async (req, res) => {
  const { restaurantId, collectionId } = req.body;

  const { error } = validateSavedRestaurant(req.body);

  if (error) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_INPUT"),
    };
    return sendErrorResponse(responseData, res);
  }

  const oldSavedRestaurant = await SavedRestaurant.findOne({
    restaurantId,
    collectionId,
  });

  if (oldSavedRestaurant) {
    const responseData = {
      flag: statusCodes.NOT_ACCEPTABLE,
      message: req.__("RESTAURANT.ARLEADY_SAVED"),
    };
    return sendErrorResponse(responseData, res);
  }

  const savedRestaurant = new SavedRestaurant({
    restaurantId,
    collectionId,
  });

  await savedRestaurant.save();

  const responseData = {
    message: req.__("RESTAURANT.SAVED"),
    data: {},
  };
  sendSuccessResponse(responseData, res);
};

exports.getSavedRestaurants = async (req, res) => {
  let { page = 1, limit = 0, collectionId } = req.query;

  const stage2Pipeline = [];
  if (limit != 0) {
    stage2Pipeline.push(
      {
        $skip: (page - 1) * limit,
      },
      { $limit: limit * 1 }
    );
  }

  let restaurants = await SavedRestaurant.aggregate([
    { $match: { collectionId: ObjectId(collectionId) } },
    {
      $lookup: {
        from: "Restaurant",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant",
      },
    },
    {
      $unwind: "$restaurant",
    },
    { $sort: { createdAt: -1 } },
    { $replaceRoot: { newRoot: "$restaurant" } },
    {
      $facet: {
        stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
        stage2: stage2Pipeline,
      },
    },
    {
      $unwind: {
        path: "$stage1",
      },
    },
    {
      $project: {
        count: "$stage1.count",
        data: "$stage2",
      },
    },
  ]);

  let restaurantsCountNumber = restaurants[0] ? restaurants[0].count : 0;
  restaurants = restaurants[0] ? restaurants[0].data : [];

  const responseData = {
    data: {
      restaurants,
      totalSavedRestaurants: restaurantsCountNumber,
      page: parseInt(page),
    },
  };
  sendSuccessResponse(responseData, res);
};

exports.deleteSavedRestaurant = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_ID"),
    };
    return sendErrorResponse(responseData, res);
  }

  const savedRestaurant = await SavedRestaurant.deleteOne({
    _id: id,
  });

  if (!savedRestaurant) {
    let response = {
      message: req.__("RESTAURANT.NOT_FOUND"),
      flag: statusCodes.NOT_FOUND,
    };
    return sendErrorResponse(response, res);
  }

  const responseData = {
    message: req.__("SAVED_RESTAURANT.DELETED"),
    data: {},
  };

  sendSuccessResponse(responseData, res);
};
