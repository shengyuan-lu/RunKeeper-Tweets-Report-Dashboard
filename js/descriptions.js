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
        if (tweet.text.toLowerCase().includes("#runkeeper") && tweet.written) {
            return true;
        } else {
            return false;
        }
    });

    // Call the addEventHandlerForSearch function
    addEventHandlerForSearch(tweet_array);
}

function populateTable(filtered_tweet_array) {
    const tweetTable = document.getElementById("tweetTable");
    tweetTable.innerHTML = ""; // Clear the table

    filtered_tweet_array.forEach(function (tweet, index) {
        const row = document.createElement("tr");

        const numberCell = document.createElement("th");
        numberCell.scope = "row";
        numberCell.textContent = index + 1;

        const activityTypeCell = document.createElement("td");
        activityTypeCell.textContent = tweet.activityType;

        const tweetCell = document.createElement("td");
        tweetCell.innerHTML = tweet.getHTMLTableRow();

        row.appendChild(numberCell);
        row.appendChild(activityTypeCell);
        row.appendChild(tweetCell);

        tweetTable.appendChild(row);
    });
}

function initSearchResult() {
    $("#searchCount").text(0);
    $("#searchText").text("");
    populateTable([]);
}

function searchTweets(tweet_array, searchText) {
    if (searchText === "") {
        initSearchResult();
    } else {
        const filteredTweets = tweet_array.filter(function (tweet) {
            if (
                tweet.writtenText
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            ) {
                return true;
            } else {
                return false;
            }
        });

        $("#searchCount").text(filteredTweets.length);
        $("#searchText").text(searchText);
        populateTable(filteredTweets);
    }
}

function addEventHandlerForSearch(tweet_array) {
    // Search the written tweets as text is entered into the search box, and add them to the table
    const textFilter = document.getElementById("textFilter");

    textFilter.addEventListener("input", () => {
        searchTweets(tweet_array, textFilter.value);
    });
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
    initSearchResult();
    loadSavedRunkeeperTweets().then(parseTweets);
});
