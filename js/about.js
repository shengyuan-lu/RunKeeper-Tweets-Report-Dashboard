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
        if (tweet.text.toLowerCase().includes("#runkeeper")) {
            return true;
        } else {
            return false;
        }
    });

    parseDate(tweet_array);
    parseCount(tweet_array);
    parseWritten(tweet_array);
}

function parseCount(tweet_array) {
    let total_tweets = tweet_array.length;

    let completed_count = 0;
    let live_count = 0;
    let achievement_count = 0;
    let miscellaneous_count = 0;

    tweet_array.forEach((tweet) => {
        switch (tweet.source) {
            case "completed_event":
                completed_count += 1;
                break;
            case "live_event":
                live_count += 1;
                break;
            case "achievement":
                achievement_count += 1;
                break;
            case "miscellaneous":
                miscellaneous_count += 1;
                break;
        }
    });

    $("#numberTweets").text(total_tweets);

    $(".completedEvents").text(completed_count);

    $(".completedEventsPct").text(
        ((completed_count * 100) / total_tweets).toFixed(2) + "%"
    );

    $(".liveEvents").text(live_count);

    $(".liveEventsPct").text(
        ((live_count * 100) / total_tweets).toFixed(2) + "%"
    );

    $(".achievements").text(achievement_count);

    $(".achievementsPct").text(
        ((achievement_count * 100) / total_tweets).toFixed(2) + "%"
    );

    $(".miscellaneous").text(miscellaneous_count);

    $(".miscellaneousPct").text(
        ((miscellaneous_count * 100) / total_tweets).toFixed(2) + "%"
    );
}

function parseDate(tweet_array) {
    let firstDate;
    let lastDate;

    tweet_array.forEach((tweet) => {
        if (!firstDate && !lastDate) {
            firstDate = tweet.time;
            lastDate = tweet.time;
        } else {
            if (tweet.time < firstDate) {
                firstDate = tweet.time;
            }

            if (tweet.time > lastDate) {
                lastDate = tweet.time;
            }
        }
    });

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    $("#firstDate").text(firstDate.toLocaleDateString("en-US", options));

    $("#lastDate").text(lastDate.toLocaleDateString("en-US", options));
}

function parseWritten(tweet_array) {
    let written_count = 0;
    let completed_count = 0;

    tweet_array.forEach((tweet) => {
        if (tweet.written && tweet.source === "completed_event") {
            written_count += 1;
        }

        if (tweet.source === "completed_event") {
            completed_count += 1;
        }
    });

    $(".written").text(written_count);

    $(".writtenPct").text(
        ((written_count * 100) / completed_count).toFixed(2) + "%"
    );

    return written_count;
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
