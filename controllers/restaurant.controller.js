const rfr = require("rfr");

const { Restaurant, validateRestaurant } = rfr("/models"),
  statusCodes = rfr("/shared/statusCode"),
  { sendErrorResponse, sendSuccessResponse } = rfr("/shared/messages");

exports.getRestaurants = async (req, res) => {
  let { page = 1, limit = 0, name, day, hours, minutes } = req.query;

  const restaurantPipeline = [];

  if (name && name !== "") {
    restaurantPipeline.push({
      $match: { name: new RegExp(name, "i") },
    });
  }
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (day && day !== "" && !isNaN(hours) && !isNaN(minutes)) {
    restaurantPipeline.push({
      $addFields: {
        desiredDays: {
          $filter: {
            input: "$schedule",
            as: "item",
            cond: { $eq: ["$$item.day", day] },
          },
        },
      },
    });
    restaurantPipeline.push({
      $match: {
        $and: [
          {
            $or: [
              { "desiredDays.startHours": { $lt: hours } },
              {
                $and: [
                  { "desiredDays.startHours": { $eq: hours } },
                  { "desiredDays.startMinutes": { $lte: minutes } },
                ],
              },
            ],
          },
          {
            $or: [
              { "desiredDays.endHours": { $gt: hours } },
              {
                $and: [
                  { "desiredDays.endHours": { $eq: hours } },
                  { "desiredDays.endMinutes": { $gte: minutes } },
                ],
              },
            ],
          },
        ],
      },
    });
  }

  // if (
  //   (hour > existingStartingHour ||
  //     (hour === existingStartingHour && minute >= existingStartingMinute)) &&
  //   (hour < existingEndingHour ||
  //     (hour === existingEndingHour && minute <= existingEndingMinute))
  // ) {
  // }

  const stage2Pipeline = [];
  if (limit != 0) {
    stage2Pipeline.push(
      {
        $skip: (page - 1) * limit,
      },
      { $limit: limit * 1 }
    );
  }

  restaurantPipeline.push(
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
    }
  );

  let restaurants = await Restaurant.aggregate(restaurantPipeline);

  const restaurantsCountNumber = restaurants[0] ? restaurants[0].count : 0;
  restaurants = restaurants[0] ? restaurants[0].data : [];

  const responseData = {
    data: {
      restaurants,
      totalRestaurants: restaurantsCountNumber,
      currentPage: parseInt(page),
    },
  };
  sendSuccessResponse(responseData, res);
};

exports.createRestaurant = async (req, res) => {
  const { name, schedule } = req.body;

  const { error } = validateRestaurant(req.body);

  if (error) {
    const responseData = {
      flag: statusCodes.UNPROCESSABLE_ENTITY,
      message: req.__("GENERAL.INVALID_INPUT"),
    };
    console.log("error", error);
    return sendErrorResponse(responseData, res);
  }

  const restaurant = new Restaurant({
    name,
    schedule,
  });

  await restaurant.save();

  const responseData = {
    message: req.__("RESTAURANT.CREATED"),
    data: {},
  };
  sendSuccessResponse(responseData, res);
};
