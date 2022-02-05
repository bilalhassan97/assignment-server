const rfr = require("rfr");

const { Restaurant, validateRestaurant } = rfr("/models"),
  statusCodes = rfr("/shared/statusCode"),
  { sendErrorResponse, sendSuccessResponse } = rfr("/shared/messages");

exports.getRestaurants = async (req, res) => {
  let { page = 1, limit = 0, name, day, hours, minutes } = req.query;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

    const checkTimePipeLine = [
      {
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
              {
                $expr: {
                  $lt: ["$desiredDays.endHours", "$desiredDays.startHours"],
                },
              },
            ],
          },
        ],
      },
    ];

    if (hours < 12) {
      const currentDayIndex = days.indexOf(day);
      const requiredIndex =
        currentDayIndex === 0 ? days.length - 1 : currentDayIndex - 1;
      const prevDay = days[requiredIndex];

      restaurantPipeline.push({
        $addFields: {
          prevDesiredDays: {
            $filter: {
              input: "$schedule",
              as: "item",
              cond: { $eq: ["$$item.day", prevDay] },
            },
          },
        },
      });

      checkTimePipeLine.push({
        $and: [
          {
            $or: [
              { "prevDesiredDays.endHours": { $gt: hours } },
              {
                $and: [
                  { "prevDesiredDays.endHours": { $eq: hours } },
                  { "prevDesiredDays.endMinutes": { $gte: minutes } },
                ],
              },
            ],
          },
          {
            $expr: {
              $lt: ["$prevDesiredDays.endHours", "$prevDesiredDays.startHours"],
            },
          },
        ],
      });
    }

    restaurantPipeline.push({
      $match: {
        $or: checkTimePipeLine,
      },
    });
  }

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
      page: parseInt(page),
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
