class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
    }

    // identify whether the source is a live event, an achievement, a completed event, or miscellaneous
    // returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        if (
            this.text.startsWith("Just completed") ||
            this.text.startsWith("Just posted") ||
            this.text.startsWith("Just linked") ||
            this.text.startsWith("I just set a goal")
        ) {
            return "completed_event";
        } else if (this.text.startsWith("Watch my")) {
            return "live_event";
        } else if (this.text.startsWith("Achieved a")) {
            return "achievement";
        }

        return "miscellaneous";
    }

    // identify whether the tweet is written
    // returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        if (this.source == "miscellaneous") {
            return true;
        } else if (this.text.includes("- TomTom MySports Watch")) {
            return false;
        } else if (this.text.includes("-")) {
            return this.getRawWrittenText().trim() != "";
        } else {
            return false;
        }
    }

    // parse the written text from the tweet
    get writtenText(): string {
        if (!this.written) {
            return "";
        } else {
            if (this.source == "miscellaneous") {
                return this.text;
            } else {
                return this.getRawWrittenText();
            }
        }
    }

    getRawWrittenText(): string {
        if (this.text.includes("-")) {
            let raw = this.text.split("-")[1];

            let raw_array = raw.split(" ");

            let filtered_array = raw_array.filter(function (element) {
                if (
                    element === "#Runkeeper" ||
                    element.startsWith("http") ||
                    element === ""
                ) {
                    return false;
                } else {
                    return true;
                }
            });

            filtered_array.forEach((element) => element.trim());

            return filtered_array.join(" ").trim();
        } else {
            return "";
        }
    }

    // parse the activity type from the text of the tweet
    get activityType(): string {
        if (this.source != "completed_event") {
            return "unknown";
        }

        const activity_set = new Set([
            "run",
            "walk",
            "swim",
            "bike",
            "hike",
            "skate",
            "workout",
            "row",
            "activity",
            "chair",
            "ski",
            "snowboard",
            "freestyle",
            "boxing"
        ]);

        let split = this.text.split(" ");

        let activity = split[5];

        if (
            activity == "elliptical" ||
            activity == "stepwell" ||
            activity == "circuit"
        ) {
            activity = "workout";
        }

        if (activity == "nordic") {
            activity = "walk";
        }

        if (activity == "mtn") {
            activity = "bike";
        }

        if (activity == "MySports") {
            activity = "freestyle";
        }

        if (activity == "MMA") {
            activity = "boxing";
        }

        if (!activity_set.has(activity)) {
            return "unknown";
        } else {
            return activity;
        }
    }

    // Lee 23-10-30-09-30: Start code

    // parse the distance from the text of the tweet
    get distance(): number {
        if (this.source != "completed_event") {
            return 0;
        }

        // Regular expression to match distances in kilometers (km) or miles (mi)
        const distanceRegex = /(\d+(\.\d+)?)\s*(km|kilometers|mi|miles)/i;

        // Search for the distance in the tweet text
        const match = this.text.match(distanceRegex);

        if (match) {
            const value = parseFloat(match[1]); // Extract the numeric value
            const unit = match[3].toLowerCase(); // Extract the unit (km or mi)

            // Convert km to mi if the unit is km
            if (unit === "km" || unit === "kilometers") {
                return value / 1.609; // Approximate conversion to miles
            } else if (unit === "mi" || unit === "miles") {
                return value; // Distance already in miles
            }
        }

        return 0; // Distance not found in the tweet text
    }

    // Lee 23-10-30-09-30: End code

    // return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
    getHTMLTableRow(): string {
        let parsedText = this.text.replace(
            /(https:\/\/[^\s]+)/g,
            "<a href='$1'>$1</a>"
        );

        return "<tr>" + parsedText + "</tr>";
    }
}
