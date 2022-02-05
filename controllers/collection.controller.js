const rfr = require("rfr");
const { isValidObjectId } = require("mongoose");
const mongoose = require("mongoose");

const statusCodes = rfr("/shared/statusCode"),
  { Collection, validateCollection } = rfr("models"),
  { sendErrorResponse, sendSuccessResponse } = rfr("/shared/messages");
const ObjectId = mongoose.Types.ObjectId;

exports.createCollection = async (req, res, next) => {
  const { title } = req.body;
  const user = req.authUser._id;

  const { error } = validateCollection({ ...req.body, user });

  if (error) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_INPUT"),
    };
    console.log("error", error);
    return sendErrorResponse(responseData, res);
  }

  const oldCollection = await Collection.findOne({ title });

  if (oldCollection) {
    const responseData = {
      flag: statusCodes.NOT_ACCEPTABLE,
      message: req.__("GENERAL.TITLE_ARLEADY_EXISTS"),
    };
    return sendErrorResponse(responseData, res);
  }

  const collection = new Collection({
    title,
    user,
  });

  await collection.save();

  const responseData = {
    message: req.__("COLLECTION.CREATED"),
    data: {},
  };
  sendSuccessResponse(responseData, res);
};

exports.getCollections = async (req, res, next) => {
  let { page = 1, limit = 0 } = req.query;
  const userId = req.authUser._id;

  const stage2Pipeline = [];
  if (limit != 0) {
    stage2Pipeline.push(
      {
        $skip: (page - 1) * limit,
      },
      { $limit: limit * 1 }
    );
  }

  if (!isValidObjectId(userId)) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_ID"),
    };
    return sendErrorResponse(responseData, res);
  }

  let collections = await Collection.aggregate([
    { $match: { user: ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
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

  let collectionsCountNumber = collections[0] ? collections[0].count : 0;
  collections = collections[0] ? collections[0].data : [];

  const responseData = {
    data: {
      collections,
      totalCollections: collectionsCountNumber,
      page: parseInt(page),
    },
  };
  sendSuccessResponse(responseData, res);
};

exports.getCollection = async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_ID"),
    };
    return sendErrorResponse(responseData, res);
  }

  const collection = await Collection.findById(id);

  if (!collection) {
    const responseData = {
      flag: statusCodes.NOT_FOUND,
      message: req.__("COLLECTION.NOT_FOUND"),
    };
    return sendErrorResponse(responseData, res);
  }

  const responseData = {
    data: { collection },
  };
  sendSuccessResponse(responseData, res);
};

exports.updateCollection = async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_ID"),
    };
    return sendErrorResponse(responseData, res);
  }

  const { title } = req.body;

  const collection = await Collection.findById(id);

  if (!collection) {
    const responseData = {
      flag: statusCodes.NOT_FOUND,
      message: req.__("COLLECTION.NOT_FOUND"),
    };

    return sendErrorResponse(responseData, res);
  }

  if (title !== collection.title) {
    const oldCollection = await Collection.findOne({ title });

    if (oldCollection) {
      const responseData = {
        flag: statusCodes.NOT_ACCEPTABLE,
        message: req.__("GENERAL.TITLE_ARLEADY_EXISTS"),
      };
      return sendErrorResponse(responseData, res);
    }
  }

  collection.title = title ? title : collection.title;

  await collection.save();

  const responseData = {
    message: req.__("COLLECTION.UPDATED"),
    data: {},
  };

  sendSuccessResponse(responseData, res);
};

exports.deleteCollection = async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_ID"),
    };
    return sendErrorResponse(responseData, res);
  }

  const collection = await Collection.deleteOne({
    _id: id,
  });

  if (!collection) {
    let response = {
      message: req.__("COLLECTION.NOT_FOUND"),
      flag: statusCodes.NOT_FOUND,
    };
    return sendErrorResponse(response, res);
  }

  const responseData = {
    message: req.__("COLLECTION.DELETED"),
    data: {},
  };

  sendSuccessResponse(responseData, res);
};
