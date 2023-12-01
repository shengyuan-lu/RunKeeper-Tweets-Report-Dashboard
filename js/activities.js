function parseTweets(runkeeper_tweets) {
    //Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert("No tweets returned");
        return;
    }

    let tweet_array = runkeeper_tweets.map(function (tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    tweet_array = tweet_array.filter(function (tweet) {
        if (
            tweet.text.toLowerCase().includes("#runkeeper") &&
            tweet.source === "completed_event"
        ) {
            return true;
        } else {
            return false;
        }
    });

    createCountGraph(tweet_array);
    createMeanGraphs(tweet_array);
}

function getActivityCount(tweet_array) {
    let activityCount = {};

    tweet_array.forEach(function (tweet) {
        const activityType = tweet.activityType;
        if (activityType in activityCount) {
            activityCount[activityType]++;
        } else {
            activityCount[activityType] = 1;
        }
    });

    return activityCount;
}

function getSortedActivityCount(tweet_array) {
    let activityCount = getActivityCount(tweet_array);

    return Object.entries(activityCount)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
}

function getTopThreeActivityTypes(sortedActivityCount) {
    return Object.keys(sortedActivityCount).slice(0, 3);
}

// Create activity count graph
function createCountGraph(tweet_array) {
    let sortedActivityCount = getSortedActivityCount(tweet_array);

    let totalTypeCount = Object.keys(sortedActivityCount).length;

    let topThreeActivityTypes = getTopThreeActivityTypes(sortedActivityCount);

    $("#numberActivities").text(totalTypeCount);
    $("#firstMost").text(topThreeActivityTypes[0]);
    $("#secondMost").text(topThreeActivityTypes[1]);
    $("#thirdMost").text(topThreeActivityTypes[2]);

    const vegaLiteActivityCount = [];

    for (const key in sortedActivityCount) {
        if (sortedActivityCount.hasOwnProperty(key)) {
            const newObj = {};
            newObj["activity"] = key;
            newObj["count"] = sortedActivityCount[key];
            vegaLiteActivityCount.push(newObj);
        }
    }

    // console.log(vegaLiteActivityCount);

    // Activity type graph
    const activityCountGraphSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Tweet Count of Each Activity Type",
        data: {
            values: vegaLiteActivityCount
        },
        mark: "point",
        encoding: {
            x: {
                field: "activity",
                type: "nominal",
                title: "Activity Type"
            },
            y: {
                field: "count",
                type: "quantitative",
                title: "Number of Tweets"
            }
        }
    };

    vegaEmbed("#activityVis", activityCountGraphSpec, { actions: false });
}

// Create activity mean graph
function createMeanGraphs(tweet_array) {
    let sortedActivityCount = getSortedActivityCount(tweet_array);

    let topThreeActivityTypes = getTopThreeActivityTypes(sortedActivityCount);

    // Tweets only contain top 3 activity types
    let filtered_tweet_array = tweet_array.filter((tweet) => {
        return topThreeActivityTypes.includes(tweet.activityType);
    });

    const vegaLiteTopThreeActivity = [];

    filtered_tweet_array.forEach(function (tweet) {
        const newObj = {};
        newObj["type"] = tweet.activityType;
        newObj["distance"] = tweet.distance;
        newObj["time"] = tweet.time;
        vegaLiteTopThreeActivity.push(newObj);
    });

    // create the visualizations which group the three most-tweeted activities by the day of the week.
    // Use those visualizations to answer the questions about which activities tended to be longest and when.

    // Activity distance graph

    const allTopThreeActivityTypesDistance = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "All Top Three Activity Type Distance by Day of the Week",
        data: {
            values: vegaLiteTopThreeActivity
        },
        mark: "point",
        encoding: {
            x: {
                field: "time",
                timeUnit: "day",
                title: "Day of the Week"
            },
            y: {
                field: "distance",
                type: "quantitative",
                title: "Distance in Miles"
            },
            color: {
                field: "type",
                type: "nominal",
                title: "Activity Type"
            }
        }
    };

    vegaEmbed("#distanceVis", allTopThreeActivityTypesDistance, {
        actions: false
    });

    // Activity distance aggregated graph
    // Group the data by day of the week and calculate the mean distance for each day
    const meanTopThreeActivityTypesDistance = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Mean Top Three Activity Type Distance by Day of the Week",
        data: {
            values: vegaLiteTopThreeActivity
        },
        mark: "point",
        encoding: {
            x: {
                field: "time",
                timeUnit: "day",
                title: "Day of the Week"
            },
            y: {
                field: "distance",
                type: "quantitative",
                aggregate: "average",
                title: "Distance in Miles"
            },
            color: {
                field: "type",
                type: "nominal",
                title: "Activity Type"
            }
        }
    };

    vegaEmbed("#distanceVisAggregated", meanTopThreeActivityTypesDistance, {
        actions: false
    });

    // hard-code answers
    $("#longestActivityType").text("bike");
    $("#shortestActivityType").text("walk");
    $("#weekdayOrWeekendLonger").text("weekend");
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
    // Load and parse tweets only after the DOM has fully loaded
    loadSavedRunkeeperTweets().then((runkeeper_tweets) => {
        // Parse the tweets and generate the graphs
        parseTweets(runkeeper_tweets);

        const aggregateButton = $("#aggregate");
        const distanceVis = $("#distanceVis");
        const distanceVisAggregated = $("#distanceVisAggregated");

        distanceVis.css("display", "block");
        distanceVisAggregated.css("display", "none");

        // Toggle between plots
        const togglePlots = () => {
            if (
                document.getElementById("distanceVis").style.display === "block"
            ) {
                distanceVis.css("display", "none");
                distanceVisAggregated.css("display", "block");
                aggregateButton.text("Show all activities");
            } else {
                distanceVis.css("display", "block");
                distanceVisAggregated.css("display", "none");
                aggregateButton.text("Show means");
            }
        };

        // Add a click listener to the button
        aggregateButton.on("click", togglePlots);
    });
});
